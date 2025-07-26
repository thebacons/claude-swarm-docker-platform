#!/usr/bin/env python3
"""
CASPER CLI - Interactive interface for the Policeman Orchestrator
"""

import os
import sys
import json
import asyncio
from datetime import datetime
import anthropic
from typing import Optional

class CasperCLI:
    """Interactive CLI for CASPER"""
    
    def __init__(self):
        # Check for API key
        self.api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            print("❌ Error: ANTHROPIC_API_KEY not set!")
            print("Please set your API key in the .env file")
            sys.exit(1)
        
        # Initialize Claude client
        self.claude = anthropic.Anthropic(api_key=self.api_key)
        
        # Load system prompt
        self.system_prompt = self._load_system_prompt()
        
        # Session context
        self.session_context = []
        
    def _load_system_prompt(self) -> str:
        """Load the Policeman system prompt"""
        prompt_file = '/workspace/policeman-system-prompt.md'
        if os.path.exists(prompt_file):
            with open(prompt_file, 'r') as f:
                return f.read()
        
        # Fallback prompt if file doesn't exist
        return """
        You are the Policeman, the central orchestrator of CASPER (Claude Agent Swarm Platform).
        You coordinate Developer-1 (frontend), Developer-2 (backend), and Tester agents.
        Break down tasks, assign to appropriate agents, and explain your orchestration strategy.
        Always respond with clear task breakdowns and agent assignments.
        """
    
    def display_banner(self):
        """Display CASPER banner"""
        banner = """
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ █████╗ ███████╗██████╗ ███████╗██████╗             ║
║  ██╔════╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗            ║
║  ██║     ███████║███████╗██████╔╝█████╗  ██████╔╝            ║
║  ██║     ██╔══██║╚════██║██╔═══╝ ██╔══╝  ██╔══██╗            ║
║  ╚██████╗██║  ██║███████║██║     ███████╗██║  ██║            ║
║   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝            ║
║                                                               ║
║        Claude Agent Swarm Platform for Enhanced Robotics      ║
║                  👮 Policeman Orchestrator Active             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
        """
        print(banner)
        print("\nType 'help' for commands, or start with your development request.")
        print("Type 'exit' or 'quit' to leave.\n")
    
    async def process_request(self, user_input: str) -> str:
        """Process user request through Claude API"""
        
        # Add user input to context
        self.session_context.append({
            "role": "user",
            "content": user_input
        })
        
        # Create the message for Claude
        try:
            response = self.claude.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2000,
                system=self.system_prompt,
                messages=self.session_context
            )
            
            # Extract response
            assistant_response = response.content[0].text
            
            # Add to context for continuity
            self.session_context.append({
                "role": "assistant",
                "content": assistant_response
            })
            
            return assistant_response
            
        except Exception as e:
            return f"❌ Error processing request: {str(e)}"
    
    def show_help(self):
        """Display help information"""
        help_text = """
📚 **CASPER Commands:**

**Development Commands:**
- Just type your development request naturally
- Examples:
  - "Create a React dashboard with authentication"
  - "Build a REST API for a blog"
  - "Refactor this code to TypeScript"

**System Commands:**
- `help` - Show this help message
- `status` - Show agent status (simulated)
- `clear` - Clear conversation context
- `export` - Export conversation to file
- `exit/quit` - Exit CASPER

**Tips:**
- Be specific about requirements
- Mention if you want parallel processing
- Specify which agents should handle what (optional)
        """
        print(help_text)
    
    def show_status(self):
        """Show simulated agent status"""
        status = """
🤖 **Agent Status:**

👮 **Policeman** (Orchestrator)
   Status: ✅ Active
   Container: claude-policeman
   Role: Central Orchestration

💻 **Developer-1** (Frontend Specialist)
   Status: ✅ Idle
   Container: claude-developer-1
   Specialization: React, UI/UX, JavaScript

💻 **Developer-2** (Backend Specialist)
   Status: ✅ Idle
   Container: claude-developer-2
   Specialization: APIs, Databases, Server Logic

🧪 **Tester** (QA Specialist)
   Status: ✅ Idle
   Container: claude-tester
   Specialization: Unit Tests, Integration Tests

📊 **System Resources:**
   Redis: ✅ Connected (Message Bus)
   PostgreSQL: ✅ Connected (Task Queue)
   Available Spawns: 3 per agent type
        """
        print(status)
    
    def export_conversation(self):
        """Export conversation to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"casper_session_{timestamp}.json"
        
        with open(f"/workspace/logs/{filename}", 'w') as f:
            json.dump({
                'timestamp': timestamp,
                'session': self.session_context
            }, f, indent=2)
        
        print(f"✅ Conversation exported to: /workspace/logs/{filename}")
    
    async def run(self):
        """Main CLI loop"""
        self.display_banner()
        
        while True:
            try:
                # Get user input
                user_input = input("👮 CASPER> ").strip()
                
                # Handle commands
                if user_input.lower() in ['exit', 'quit']:
                    print("\n👋 Goodbye! CASPER signing off.")
                    break
                
                elif user_input.lower() == 'help':
                    self.show_help()
                    continue
                
                elif user_input.lower() == 'status':
                    self.show_status()
                    continue
                
                elif user_input.lower() == 'clear':
                    self.session_context = []
                    print("✅ Conversation context cleared.")
                    continue
                
                elif user_input.lower() == 'export':
                    self.export_conversation()
                    continue
                
                elif not user_input:
                    continue
                
                # Process as orchestration request
                print("\n🔄 Processing your request...\n")
                response = await self.process_request(user_input)
                print(response)
                print("\n" + "="*60 + "\n")
                
            except KeyboardInterrupt:
                print("\n\n👋 Interrupted. Use 'exit' to quit properly.")
                continue
            except Exception as e:
                print(f"\n❌ Error: {str(e)}\n")

def main():
    """Entry point"""
    # Check if running in container
    if not os.path.exists('/workspace'):
        print("⚠️  Warning: Not running in CASPER container environment")
        print("Some features may not work correctly.\n")
    
    # Create CLI instance and run
    cli = CasperCLI()
    asyncio.run(cli.run())

if __name__ == "__main__":
    main()