#!/usr/bin/env python3
"""
Claude Swarm Orchestrator - Manages parallel AI agents
"""

import os
import sys
import json
import yaml
import asyncio
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from anthropic import Anthropic
from concurrent.futures import ThreadPoolExecutor, as_completed
import queue

class ClaudeAgent:
    """Individual AI agent with specific role and capabilities"""
    
    def __init__(self, name: str, config: dict, api_key: str):
        self.name = name
        self.config = config
        self.client = Anthropic(api_key=api_key)
        self.model = config.get('model', 'claude-3-5-sonnet-20241022')
        self.directory = Path(config.get('directory', '.'))
        self.tools = config.get('tools', [])
        self.connections = config.get('connections', [])
        self.description = config.get('description', '')
        self.message_queue = queue.Queue()
        self.context = []
        
    def think(self, task: str, context: List[dict] = None) -> str:
        """Process a task with optional context from other agents"""
        
        # Build system prompt based on role
        system_prompt = f"""You are {self.name}, {self.description}
        
Your capabilities: {', '.join(self.tools)}
Connected agents: {', '.join(self.connections)}
Working directory: {self.directory}

Respond as this specific agent would, focusing on your area of expertise."""

        # Add context from other agents if provided
        messages = []
        if context:
            messages.append({
                "role": "user", 
                "content": f"Context from other agents:\n" + "\n".join([
                    f"{c['agent']}: {c['message']}" for c in context
                ])
            })
        
        messages.append({"role": "user", "content": task})
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text
        except Exception as e:
            return f"Error in {self.name}: {str(e)}"
    
    def send_message(self, message: str, to_agent: str = None):
        """Send a message to another agent or broadcast"""
        self.message_queue.put({
            'from': self.name,
            'to': to_agent,
            'message': message,
            'timestamp': datetime.now()
        })

class SwarmOrchestrator:
    """Manages multiple Claude agents working in parallel"""
    
    def __init__(self, config_file: str):
        self.config = self._load_config(config_file)
        self.api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")
        
        self.agents: Dict[str, ClaudeAgent] = {}
        self.message_bus = queue.Queue()
        self.session_dir = self._create_session()
        self._initialize_agents()
        
    def _load_config(self, config_file: str) -> dict:
        """Load swarm configuration from YAML"""
        with open(config_file, 'r') as f:
            return yaml.safe_load(f)
    
    def _create_session(self) -> Path:
        """Create session directory for logs and artifacts"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        session_dir = Path(f"sessions/swarm_{timestamp}")
        session_dir.mkdir(parents=True, exist_ok=True)
        return session_dir
    
    def _initialize_agents(self):
        """Create agent instances from configuration"""
        instances = self.config.get('instances', {})
        
        for agent_name, agent_config in instances.items():
            self.agents[agent_name] = ClaudeAgent(
                name=agent_name,
                config=agent_config,
                api_key=self.api_key
            )
            
            # Create agent log file
            log_file = self.session_dir / f"{agent_name}.log"
            log_file.touch()
    
    def delegate_task(self, task: str, to_agent: str = None) -> Dict[str, str]:
        """Delegate a task to specific agent or main agent"""
        if to_agent and to_agent in self.agents:
            agent = self.agents[to_agent]
            response = agent.think(task)
            self._log_interaction(to_agent, task, response)
            return {to_agent: response}
        
        # Delegate to main agent
        main_agent_name = self.config['swarm'].get('main', list(self.agents.keys())[0])
        main_agent = self.agents[main_agent_name]
        response = main_agent.think(task)
        self._log_interaction(main_agent_name, task, response)
        return {main_agent_name: response}
    
    def parallel_task(self, tasks: Dict[str, str]) -> Dict[str, str]:
        """Execute tasks in parallel across multiple agents"""
        results = {}
        
        with ThreadPoolExecutor(max_workers=len(tasks)) as executor:
            future_to_agent = {
                executor.submit(self.agents[agent].think, task): agent
                for agent, task in tasks.items()
                if agent in self.agents
            }
            
            for future in as_completed(future_to_agent):
                agent = future_to_agent[future]
                try:
                    result = future.result()
                    results[agent] = result
                    self._log_interaction(agent, tasks[agent], result)
                except Exception as e:
                    results[agent] = f"Error: {str(e)}"
        
        return results
    
    def collaborative_task(self, main_task: str, subtasks: Dict[str, str]) -> Dict[str, str]:
        """Main agent coordinates, others work on subtasks in parallel"""
        results = {}
        
        # Main agent creates the plan
        main_agent_name = self.config['swarm'].get('main')
        main_agent = self.agents[main_agent_name]
        
        plan = main_agent.think(f"Create a plan for: {main_task}")
        results[main_agent_name] = plan
        self._log_interaction(main_agent_name, main_task, plan)
        
        # Execute subtasks in parallel
        subtask_results = self.parallel_task(subtasks)
        
        # Main agent synthesizes results
        context = [{'agent': agent, 'message': result} 
                   for agent, result in subtask_results.items()]
        
        synthesis = main_agent.think(
            "Synthesize these results into a cohesive solution",
            context=context
        )
        
        results['synthesis'] = synthesis
        results.update(subtask_results)
        
        return results
    
    def _log_interaction(self, agent: str, task: str, response: str):
        """Log agent interactions to session files"""
        log_file = self.session_dir / f"{agent}.log"
        with open(log_file, 'a') as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"Timestamp: {datetime.now()}\n")
            f.write(f"Task: {task}\n")
            f.write(f"Response:\n{response}\n")
    
    def get_session_summary(self) -> str:
        """Generate summary of swarm session"""
        summary = f"Swarm Session: {self.session_dir.name}\n"
        summary += f"Agents: {', '.join(self.agents.keys())}\n"
        summary += f"Configuration: {self.config['swarm']['name']}\n"
        summary += f"\nSession logs available at: {self.session_dir}\n"
        return summary

# Demo functions
def demo_basic_swarm():
    """Demonstrate basic swarm functionality"""
    print("🚀 Claude Swarm Demo - Basic Parallel Execution\n")
    
    # Create a simple config
    config = {
        'swarm': {
            'name': 'Demo Team',
            'main': 'lead'
        },
        'instances': {
            'lead': {
                'description': 'Lead coordinator',
                'model': 'claude-3-5-sonnet-20241022',
                'tools': ['Read', 'Write', 'Edit']
            },
            'frontend': {
                'description': 'Frontend developer',
                'model': 'claude-3-haiku-20240307',
                'tools': ['Read', 'Write']
            },
            'backend': {
                'description': 'Backend developer', 
                'model': 'claude-3-haiku-20240307',
                'tools': ['Read', 'Write']
            }
        }
    }
    
    # Save config temporarily
    with open('/tmp/demo-swarm.yml', 'w') as f:
        yaml.dump(config, f)
    
    # Create orchestrator
    swarm = SwarmOrchestrator('/tmp/demo-swarm.yml')
    
    # Example 1: Single agent task
    print("1️⃣ Single Agent Task:")
    result = swarm.delegate_task("Design a simple todo app architecture")
    for agent, response in result.items():
        print(f"\n{agent}: {response[:200]}...")
    
    # Example 2: Parallel tasks
    print("\n\n2️⃣ Parallel Agent Tasks:")
    tasks = {
        'frontend': 'Create a React component for a todo item',
        'backend': 'Design a REST API endpoint for creating todos'
    }
    
    results = swarm.parallel_task(tasks)
    for agent, response in results.items():
        print(f"\n{agent}: {response[:200]}...")
    
    # Example 3: Collaborative task
    print("\n\n3️⃣ Collaborative Task:")
    main_task = "Build a complete todo application"
    subtasks = {
        'frontend': 'Implement the UI components',
        'backend': 'Create the API and database schema'
    }
    
    results = swarm.collaborative_task(main_task, subtasks)
    print(f"\nSynthesis: {results.get('synthesis', '')[:300]}...")
    
    print(f"\n\n{swarm.get_session_summary()}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        demo_basic_swarm()
    elif len(sys.argv) > 1:
        # Run with provided config
        swarm = SwarmOrchestrator(sys.argv[1])
        print(f"Swarm initialized: {swarm.config['swarm']['name']}")
        print("Agents ready:", ", ".join(swarm.agents.keys()))
    else:
        print("Usage:")
        print("  python swarm-orchestrator.py demo     # Run demo")
        print("  python swarm-orchestrator.py config.yml  # Run with config")