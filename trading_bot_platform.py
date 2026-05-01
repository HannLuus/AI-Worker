#!/usr/bin/env python3
"""
TB001 - Platform-Integrated Trading Bot
Uses Supabase as state store instead of local state.json
Reports all activity to agent_runs table
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
import requests
import logging

# Configuration from environment
SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://72.61.208.230:8000")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
AGENT_ID = os.environ.get("AGENT_ID", "969989c9-14fc-4e64-8a37-ef3640c166f7")

# Alpaca API endpoints
ALPACA_TRADE_URL = "https://paper-api.alpaca.markets/v2"
ALPACA_DATA_URL = "https://data.alpaca.markets/v2"

class SupabaseTradingBot:
    """Trading bot that uses Supabase as its state store."""
    
    def __init__(self):
        self.agent_id = AGENT_ID
        self.supabase_url = SUPABASE_URL
        self.supabase_headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json"
        }
        
        self.state = None
        self.config = None
        self.today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self.run_id = None
        
        self.setup_logging()
        self.logger.info(f"=== Platform Bot initialized | Agent: {self.agent_id} ===")
        
    def setup_logging(self):
        """Setup stdout logging (no local files)."""
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s | %(levelname)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            handlers=[logging.StreamHandler(sys.stdout)]
        )
        self.logger = logging.getLogger(__name__)
        
    def supabase_request(self, method, path, data=None, params=None):
        """Make a request to Supabase."""
        url = f"{self.supabase_url}/rest/v1/{path}"
        try:
            if method == "GET":
                resp = requests.get(url, headers=self.supabase_headers, params=params, timeout=10)
            elif method == "POST":
                resp = requests.post(url, headers=self.supabase_headers, json=data, timeout=10)
            elif method == "PATCH":
                resp = requests.patch(url, headers=self.supabase_headers, json=data, params=params, timeout=10)
            else:
                raise ValueError(f"Unknown method: {method}")
            resp.raise_for_status()
            return resp.json() if resp.text else None
        except Exception as e:
            self.logger.error(f"Supabase request failed: {e}")
            return None
            
    def load_trading_state(self):
        """Load trading state from Supabase."""
        result = self.supabase_request(
            "GET", 
            "trading_state",
            params={"agent_id": f"eq.{self.agent_id}", "limit": 1}
        )
        if result and len(result) > 0:
            return result[0]
        return None
        
    def save_trading_state(self, updates):
        """Save trading state to Supabase."""
        if self.state and self.state.get("id"):
            self.supabase_request(
                "PATCH",
                f"trading_state",
                data={**updates, "updated_at": datetime.now(timezone.utc).isoformat()},
                params={"id": f"eq.{self.state['id']}"}
            )
            
    def create_agent_run(self):
        """Create a new agent run record."""
        agent_data = self.supabase_request(
            "GET", 
            f"agents",
            params={"id": f"eq.{self.agent_id}", "select": "owner_id", "limit": 1}
        )
        if not agent_data:
            raise Exception("Agent not found")
            
        owner_id = agent_data[0]["owner_id"]
        
        result = self.supabase_request(
            "POST",
            "agent_runs",
            data={
                "agent_id": self.agent_id,
                "owner_id": owner_id,
                "status": "running",
                "started_at": datetime.now(timezone.utc).isoformat()
            }
        )
        if result and len(result) > 0:
            self.run_id = result[0]["id"]
            self.logger.info(f"Agent run created: {self.run_id}")
            return self.run_id
        return None
        
    def update_agent_run(self, status, output=None, error=None, tokens_used=0):
        """Update agent run with results."""
        if not self.run_id:
            return
            
        data = {
            "status": status,
            "finished_at": datetime.now(timezone.utc).isoformat()
        }
        if output:
            data["output"] = output
        if error:
            data["error_message"] = error
        if tokens_used:
            data["tokens_used"] = tokens_used
            
        self.supabase_request(
            "PATCH",
            "agent_runs",
            data=data,
            params={"id": f"eq.{self.run_id}"}
        )
        self.logger.info(f"Agent run updated: {status}")
        
    def get_alpaca_headers(self):
        """Get Alpaca API headers from state."""
        return {
            "APCA-API-KEY-ID": self.state["alpaca_api_key"],
            "APCA-API-SECRET-KEY": self.state["alpaca_api_secret"],
            "Content-Type": "application/json"
        }
        
    def is_market_open(self):
        """Check if market is open."""
        try:
            resp = requests.get(
                f"{ALPACA_TRADE_URL}/clock",
                headers=self.get_alpaca_headers(),
                timeout=10
            )
            resp.raise_for_status()
            return resp.json().get("is_open", False)
        except Exception as e:
            self.logger.error(f"Failed to check market: {e}")
            return False
            
    def get_position(self):
        """Get current position from Alpaca."""
        symbol = self.state["symbol"]
        try:
            resp = requests.get(
                f"{ALPACA_TRADE_URL}/positions/{symbol}",
                headers=self.get_alpaca_headers(),
                timeout=10
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            pos = resp.json()
            return {
                "qty": float(pos["qty"]),
                "avg_entry_price": float(pos["avg_entry_price"]),
                "current_price": float(pos["current_price"]),
                "market_value": float(pos["market_value"])
            }
        except Exception as e:
            self.logger.error(f"Failed to get position: {e}")
            return None
            
    def get_latest_trade(self, symbol):
        """Get latest trade price."""
        try:
            resp = requests.get(
                f"{ALPACA_DATA_URL}/stocks/{symbol}/trades/latest",
                headers=self.get_alpaca_headers(),
                timeout=10
            )
            resp.raise_for_status()
            return float(resp.json()["trade"]["p"])
        except Exception as e:
            self.logger.error(f"Failed to get price: {e}")
            return None
            
    def get_daily_change_pct(self, symbol):
        """Get daily change percentage."""
        try:
            resp = requests.get(
                f"{ALPACA_DATA_URL}/stocks/{symbol}/bars",
                headers=self.get_alpaca_headers(),
                params={"timeframe": "1D", "limit": 2},
                timeout=10
            )
            resp.raise_for_status()
            bars = resp.json().get("bars", [])
            if len(bars) >= 2:
                return (bars[-1]["c"] - bars[-2]["c"]) / bars[-2]["c"]
        except Exception as e:
            self.logger.error(f"Failed to get daily change: {e}")
        return 0
        
    def place_order(self, symbol, qty, side, order_type="market", stop_price=None):
        """Place order on Alpaca."""
        try:
            payload = {
                "symbol": symbol,
                "qty": str(qty),
                "side": side,
                "type": order_type,
                "time_in_force": "day"
            }
            if stop_price:
                payload["stop_price"] = str(round(stop_price, 2))
                
            resp = requests.post(
                f"{ALPACA_TRADE_URL}/orders",
                headers=self.get_alpaca_headers(),
                json=payload,
                timeout=10
            )
            resp.raise_for_status()
            order = resp.json()
            self.logger.info(f"Order placed: {side} {qty} {symbol} @ {order_type}")
            return order
        except Exception as e:
            self.logger.error(f"Failed to place order: {e}")
            return None
            
    def cancel_order(self, order_id):
        """Cancel order on Alpaca."""
        try:
            resp = requests.delete(
                f"{ALPACA_TRADE_URL}/orders/{order_id}",
                headers=self.get_alpaca_headers(),
                timeout=10
            )
            resp.raise_for_status()
            return True
        except Exception as e:
            self.logger.error(f"Failed to cancel order: {e}")
            return False
            
    def get_open_orders(self):
        """Get open orders."""
        try:
            resp = requests.get(
                f"{ALPACA_TRADE_URL}/orders",
                headers=self.get_alpaca_headers(),
                params={"status": "open"},
                timeout=10
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            self.logger.error(f"Failed to get orders: {e}")
            return []
            
    def macro_check(self):
        """Run macro safety checks."""
        # Check geo_hold from database
        if self.state.get("geo_hold_active", False):
            self.logger.info("Macro: geo_hold_active = true - HALT")
            return False
            
        spy_change = self.get_daily_change_pct("SPY")
        uso_change = self.get_daily_change_pct("USO")
        
        spy_threshold = self.state.get("spy_threshold", -0.03)
        uso_threshold = self.state.get("uso_threshold", 0.03)
        
        if spy_change <= spy_threshold:
            self.logger.info(f"Macro: SPY {spy_change:.2%} ≤ {spy_threshold:.2%} - HALT")
            return False
            
        if uso_change >= uso_threshold:
            self.logger.info(f"Macro: USO {uso_change:.2%} ≥ {uso_threshold:.2%} - HALT")
            return False
            
        self.logger.info(f"Macro: PASSED (SPY: {spy_change:.2%}, USO: {uso_change:.2%})")
        return True
        
    def reconcile_position(self):
        """Reconcile state with Alpaca position."""
        alpaca_pos = self.get_position()
        state_phase = self.state["phase"]
        
        if state_phase in ["ACTIVE", "ENTRY_PENDING"] and alpaca_pos is None:
            self.logger.warning("RECONCILE: State ACTIVE but no position. Resetting to IDLE.")
            self.save_trading_state({
                "phase": "IDLE",
                "shares_held": 0,
                "cost_basis": None,
                "high_water_mark": None,
                "trailing_active": False,
                "current_floor": None,
                "stop_order_id": None,
                "ladders_triggered": [],
                "half_profit_taken": False
            })
            self.state["phase"] = "IDLE"
            self.state["shares_held"] = 0
            
        elif state_phase == "IDLE" and alpaca_pos is not None:
            self.logger.warning("RECONCILE: State IDLE but position found. Recovering.")
            self.save_trading_state({
                "phase": "ACTIVE",
                "shares_held": int(alpaca_pos["qty"]),
                "cost_basis": alpaca_pos["avg_entry_price"],
                "high_water_mark": alpaca_pos["current_price"],
                "entry_date": self.today
            })
            self.state["phase"] = "ACTIVE"
            self.state["shares_held"] = int(alpaca_pos["qty"])
            self.state["cost_basis"] = alpaca_pos["avg_entry_price"]
            
    def calculate_floor(self, hwm):
        """Calculate trailing stop floor."""
        pct = self.state.get("trailing_floor_pct", 0.05)
        return hwm * (1 - pct)
        
    def update_stop_order(self, new_floor, qty):
        """Update stop order."""
        if self.state.get("stop_order_id"):
            self.cancel_order(self.state["stop_order_id"])
            
        stop_price = round(new_floor, 2)
        order = self.place_order(
            self.state["symbol"], 
            qty, 
            "sell", 
            "stop", 
            stop_price
        )
        if order:
            self.save_trading_state({
                "stop_order_id": order["id"],
                "current_floor": new_floor
            })
            self.state["stop_order_id"] = order["id"]
            self.state["current_floor"] = new_floor
            
    def check_ladders(self, current_price, macro_safe):
        """Check and fire ladder buys."""
        if not macro_safe:
            return
            
        cost_basis = self.state.get("cost_basis")
        if not cost_basis:
            return
            
        pct_from_basis = (current_price - cost_basis) / cost_basis
        ladders = self.state.get("ladders_triggered", [])
        
        # Ladder 1
        l1_pct = self.state.get("ladder_1_pct", -0.20)
        l1_shares = self.state.get("ladder_1_shares", 20)
        
        if "L1" not in ladders and pct_from_basis <= l1_pct:
            self.logger.info(f"LADDER 1: Price {pct_from_basis:.1%}, buying {l1_shares}")
            order = self.place_order(self.state["symbol"], l1_shares, "buy")
            if order:
                old_shares = self.state["shares_held"]
                old_cost = old_shares * cost_basis
                new_cost = l1_shares * current_price
                total = old_shares + l1_shares
                new_basis = (old_cost + new_cost) / total
                
                self.save_trading_state({
                    "shares_held": total,
                    "cost_basis": new_basis,
                    "ladders_triggered": ladders + ["L1"],
                    "high_water_mark": current_price,
                    "trailing_active": False,
                    "current_floor": None
                })
                
                hard_stop = new_basis * (1 + self.state.get("hard_stop_pct", -0.10))
                self.update_stop_order(hard_stop, total)
                
        # Ladder 2
        l2_pct = self.state.get("ladder_2_pct", -0.30)
        l2_shares = self.state.get("ladder_2_shares", 10)
        
        if "L2" not in ladders and pct_from_basis <= l2_pct:
            self.logger.info(f"LADDER 2: Price {pct_from_basis:.1%}, buying {l2_shares}")
            order = self.place_order(self.state["symbol"], l2_shares, "buy")
            if order:
                old_shares = self.state["shares_held"]
                old_cost = old_shares * self.state["cost_basis"]
                new_cost = l2_shares * current_price
                total = old_shares + l2_shares
                new_basis = (old_cost + new_cost) / total
                
                self.save_trading_state({
                    "shares_held": total,
                    "cost_basis": new_basis,
                    "ladders_triggered": ladders + ["L2"],
                    "high_water_mark": current_price,
                    "trailing_active": False,
                    "current_floor": None
                })
                
                hard_stop = new_basis * (1 + self.state.get("hard_stop_pct", -0.10))
                self.update_stop_order(hard_stop, total)
                
    def check_half_profit(self, current_price):
        """Check half profit rule."""
        if self.state.get("half_profit_taken", False):
            return
            
        cost_basis = self.state.get("cost_basis")
        if not cost_basis:
            return
            
        gain_pct = (current_price - cost_basis) / cost_basis
        half_profit_pct = self.state.get("half_profit_pct", 0.30)
        
        if gain_pct >= half_profit_pct:
            shares_to_sell = self.state["shares_held"] // 2
            if shares_to_sell > 0:
                self.logger.info(f"HALF PROFIT: Gain {gain_pct:.1%}, selling {shares_to_sell}")
                order = self.place_order(self.state["symbol"], shares_to_sell, "sell")
                if order:
                    realized = shares_to_sell * (current_price - cost_basis)
                    remaining = self.state["shares_held"] - shares_to_sell
                    
                    self.save_trading_state({
                        "realized_pnl": self.state.get("realized_pnl", 0) + realized,
                        "shares_held": remaining,
                        "half_profit_taken": True
                    })
                    
                    if remaining > 0 and self.state.get("current_floor"):
                        self.update_stop_order(self.state["current_floor"], remaining)
                    elif remaining == 0:
                        self.save_trading_state({
                            "phase": "IDLE",
                            "cost_basis": None,
                            "stop_order_id": None
                        })
                        
    def manage_trailing_stop(self, current_price):
        """Manage trailing stop."""
        cost_basis = self.state.get("cost_basis")
        hwm = self.state.get("high_water_mark")
        
        if not cost_basis or not hwm:
            return
            
        gain_pct = (current_price - cost_basis) / cost_basis
        trailing_activate = self.state.get("trailing_activate_pct", 0.10)
        
        # Activate trailing
        if not self.state.get("trailing_active", False) and gain_pct >= trailing_activate:
            self.logger.info(f"TRAILING ACTIVATED at {gain_pct:.1%} gain")
            new_floor = self.calculate_floor(current_price)
            self.save_trading_state({
                "trailing_active": True,
                "high_water_mark": current_price
            })
            self.state["high_water_mark"] = current_price
            self.update_stop_order(new_floor, self.state["shares_held"])
            
        # Update trailing if new high
        elif self.state.get("trailing_active", False) and current_price > hwm:
            old_floor = self.state.get("current_floor")
            new_floor = self.calculate_floor(current_price)
            
            if new_floor > old_floor:
                self.logger.info(f"TRAILING UPDATE: floor ${old_floor:.2f} → ${new_floor:.2f}")
                self.save_trading_state({"high_water_mark": current_price})
                self.update_stop_order(new_floor, self.state["shares_held"])
                
    def run(self):
        """Main bot cycle."""
        self.logger.info("--- Starting trading cycle ---")
        
        # Load state from Supabase
        self.state = self.load_trading_state()
        if not self.state:
            self.logger.error("No trading state found. Initialize via dashboard first.")
            return False
            
        # Create agent run record
        self.create_agent_run()
        
        try:
            # Check market
            market_open = self.is_market_open()
            self.save_trading_state({
                "last_run_at": datetime.now(timezone.utc).isoformat(),
                "market_was_open": market_open
            })
            
            if not market_open:
                self.logger.info("Market closed.")
                self.update_agent_run("success", output="Market closed, no action taken.")
                return True
                
            # Reconcile position
            self.reconcile_position()
            
            # Get current price
            current_price = self.get_latest_trade(self.state["symbol"])
            if not current_price:
                raise Exception("Failed to get current price")
            self.logger.info(f"Price: ${current_price:.2f}")
            
            # Macro check
            macro_safe = self.macro_check()
            
            # IDLE - entry
            if self.state["phase"] == "IDLE":
                entry_shares = self.state.get("entry_shares", 10)
                if macro_safe:
                    self.logger.info(f"IDLE: Buying {entry_shares} shares")
                    order = self.place_order(self.state["symbol"], entry_shares, "buy")
                    if order:
                        self.save_trading_state({
                            "phase": "ENTRY_PENDING",
                            "pending_order_id": order["id"],
                            "entry_date": self.today
                        })
                else:
                    self.logger.info("IDLE: Macro unsafe - no entry")
                    
            # ENTRY_PENDING - check fill
            elif self.state["phase"] == "ENTRY_PENDING":
                pending_id = self.state.get("pending_order_id")
                orders = self.get_open_orders()
                still_pending = any(o["id"] == pending_id for o in orders)
                
                if not still_pending:
                    pos = self.get_position()
                    if pos and pos["qty"] > 0:
                        self.save_trading_state({
                            "phase": "ACTIVE",
                            "shares_held": int(pos["qty"]),
                            "cost_basis": pos["avg_entry_price"],
                            "high_water_mark": current_price,
                            "pending_order_id": None
                        })
                        self.logger.info(f"Entry filled: {pos['qty']} @ ${pos['avg_entry_price']:.2f}")
                        
                        # Place hard stop
                        hard_stop = pos["avg_entry_price"] * (1 + self.state.get("hard_stop_pct", -0.10))
                        self.update_stop_order(hard_stop, int(pos["qty"]))
                    else:
                        self.logger.warning("Entry not filled, resetting")
                        self.save_trading_state({"phase": "IDLE", "pending_order_id": None})
                        
            # ACTIVE - manage position
            elif self.state["phase"] == "ACTIVE":
                if self.state["shares_held"] == 0:
                    self.save_trading_state({"phase": "IDLE"})
                    self.update_agent_run("success", output="Position closed.")
                    return True
                    
                # Update HWM
                if current_price > (self.state.get("high_water_mark") or 0):
                    self.state["high_water_mark"] = current_price
                    
                self.check_half_profit(current_price)
                self.manage_trailing_stop(current_price)
                self.check_ladders(current_price, macro_safe)
                
            # Build summary
            pos = self.get_position()
            summary = f"Phase: {self.state['phase']}, Price: ${current_price:.2f}"
            if pos:
                summary += f", Position: {pos['qty']} shares, Value: ${pos['market_value']:.2f}"
                
            self.update_agent_run("success", output=summary)
            self.logger.info("--- Cycle complete ---")
            return True
            
        except Exception as e:
            error_msg = str(e)
            self.logger.error(f"Error: {error_msg}")
            self.save_trading_state({"last_error": error_msg})
            self.update_agent_run("failed", error=error_msg)
            return False


def main():
    bot = SupabaseTradingBot()
    success = bot.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
