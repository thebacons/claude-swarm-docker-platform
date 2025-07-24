#!/usr/bin/env python3
"""
Simple Claude Swarm Demo - See parallel agents in action!
"""

import os
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from anthropic import Anthropic

# Colors for output
COLORS = {
    'lead': '\033[94m',      # Blue
    'frontend': '\033[92m',   # Green
    'backend': '\033[93m',    # Yellow
    'tester': '\033[95m',     # Magenta
    'reset': '\033[0m'
}

class SimpleAgent:
    def __init__(self, name, role, model="claude-3-haiku-20240307"):
        self.name = name
        self.role = role
        self.model = model
        self.client = Anthropic()
        
    def work(self, task):
        """Agent works on a task"""
        print(f"{COLORS.get(self.name, '')}[{self.name}] Starting: {task}{COLORS['reset']}")
        
        start_time = time.time()
        
        prompt = f"As a {self.role}, {task}. Be concise (2-3 sentences)."
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            result = response.content[0].text
        except Exception as e:
            result = f"Error: {str(e)}"
        
        elapsed = time.time() - start_time
        
        print(f"{COLORS.get(self.name, '')}[{self.name}] Completed in {elapsed:.1f}s{COLORS['reset']}")
        return result

def run_parallel_demo():
    """Demonstrate parallel agent execution"""
    
    print("🚀 Claude Swarm Parallel Execution Demo\n")
    print("This demo shows how multiple AI agents work simultaneously!\n")
    
    # Create agents
    agents = {
        'lead': SimpleAgent('lead', 'lead developer', 'claude-3-5-sonnet-20241022'),
        'frontend': SimpleAgent('frontend', 'frontend developer'),
        'backend': SimpleAgent('backend', 'backend developer'),
        'tester': SimpleAgent('tester', 'QA engineer')
    }
    
    # Demo 1: Sequential (traditional) approach
    print("="*60)
    print("1️⃣  SEQUENTIAL Execution (one at a time):")
    print("="*60)
    
    tasks = {
        'lead': 'Plan the architecture for a chat application',
        'frontend': 'Design the chat UI components',
        'backend': 'Design the database schema for messages',
        'tester': 'Create a test plan for the chat feature'
    }
    
    sequential_start = time.time()
    sequential_results = {}
    
    for agent_name, task in tasks.items():
        agent = agents[agent_name]
        result = agent.work(task)
        sequential_results[agent_name] = result
        print(f"Result: {result}\n")
    
    sequential_time = time.time() - sequential_start
    
    # Demo 2: Parallel approach
    print("\n" + "="*60)
    print("2️⃣  PARALLEL Execution (all at once):")
    print("="*60)
    
    parallel_start = time.time()
    parallel_results = {}
    
    # Execute all tasks in parallel
    with ThreadPoolExecutor(max_workers=len(agents)) as executor:
        future_to_agent = {
            executor.submit(agents[name].work, task): name 
            for name, task in tasks.items()
        }
        
        for future in future_to_agent:
            agent_name = future_to_agent[future]
            result = future.result()
            parallel_results[agent_name] = result
    
    parallel_time = time.time() - parallel_start
    
    # Show results
    print("\n" + "="*60)
    print("📊 RESULTS COMPARISON:")
    print("="*60)
    
    print(f"\nSequential execution time: {sequential_time:.1f} seconds")
    print(f"Parallel execution time: {parallel_time:.1f} seconds")
    print(f"⚡ Speed improvement: {sequential_time/parallel_time:.1f}x faster!\n")
    
    # Demo 3: Collaborative workflow
    print("="*60)
    print("3️⃣  COLLABORATIVE Workflow:")
    print("="*60)
    
    # Lead creates plan
    lead_plan = agents['lead'].work("Create a development plan for a todo app with React and Node.js")
    print(f"\nLead's Plan: {lead_plan}\n")
    
    # Others work based on the plan
    collab_tasks = {
        'frontend': f"Based on this plan: '{lead_plan[:100]}...', implement the React components",
        'backend': f"Based on this plan: '{lead_plan[:100]}...', implement the API endpoints",
        'tester': f"Based on this plan: '{lead_plan[:100]}...', write integration tests"
    }
    
    print("Team working on implementation in parallel...\n")
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_agent = {
            executor.submit(agents[name].work, task): name 
            for name, task in collab_tasks.items()
        }
        
        collab_results = {}
        for future in future_to_agent:
            agent_name = future_to_agent[future]
            result = future.result()
            collab_results[agent_name] = result
            print(f"\n{agent_name} result: {result}")
    
    print("\n" + "="*60)
    print("✅ DEMO COMPLETE!")
    print("="*60)
    print("\nKey Insights:")
    print("- Parallel execution is significantly faster")
    print("- Agents can work independently on related tasks")
    print("- Lead agent can coordinate and delegate")
    print("- Real projects would include inter-agent communication")
    print("\nThis is how Claude Swarm enables AI team collaboration! 🎉")

if __name__ == "__main__":
    # Check API key
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print("❌ Error: ANTHROPIC_API_KEY not found in environment!")
        print("Make sure you're in the Docker container with the .env loaded.")
        exit(1)
    
    try:
        run_parallel_demo()
    except KeyboardInterrupt:
        print("\n\nDemo interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")