#!/usr/bin/env python3
"""
CASPER Policeman Orchestrator
Central AI orchestration agent for the Claude Agent Swarm Platform
"""

import os
import json
import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
import anthropic
import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import subprocess
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='👮 %(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('Policeman')

class Agent:
    """Represents an agent in the swarm"""
    def __init__(self, name: str, container: str, role: str, specialization: str = None):
        self.name = name
        self.container = container
        self.role = role
        self.specialization = specialization
        self.status = "idle"
        self.current_task = None

class PolicemanOrchestrator:
    """Main orchestrator class for CASPER"""
    
    def __init__(self):
        # Initialize Anthropic client
        self.claude = anthropic.Anthropic(
            api_key=os.environ.get('ANTHROPIC_API_KEY')
        )
        
        # Initialize Redis connection
        self.redis_client = redis.Redis(
            host=os.environ.get('REDIS_HOST', 'claude-redis'),
            port=6379,
            password=os.environ.get('REDIS_PASSWORD', ''),
            decode_responses=True
        )
        
        # Initialize PostgreSQL connection
        self.db_conn = psycopg2.connect(
            host=os.environ.get('POSTGRES_HOST', 'claude-postgres'),
            database=os.environ.get('POSTGRES_DB', 'claude_orchestration'),
            user=os.environ.get('POSTGRES_USER', 'claude'),
            password=os.environ.get('POSTGRES_PASSWORD', '')
        )
        
        # Define available agents
        self.agents = {
            'developer-1': Agent(
                name='Developer-1',
                container='claude-developer-1',
                role='developer',
                specialization='frontend'
            ),
            'developer-2': Agent(
                name='Developer-2',
                container='claude-developer-2',
                role='developer',
                specialization='backend'
            ),
            'tester': Agent(
                name='Tester',
                container='claude-tester',
                role='tester',
                specialization='qa'
            )
        }
        
        # Swarm management
        self.spawned_agents = {}
        self.max_spawn_per_type = 3
        
        # Load system prompt
        self.system_prompt = self._load_system_prompt()
        
    def _load_system_prompt(self) -> str:
        """Load the Policeman system prompt"""
        prompt_file = '/workspace/policeman-system-prompt.md'
        if os.path.exists(prompt_file):
            with open(prompt_file, 'r') as f:
                return f.read()
        return "You are the Policeman orchestrator for CASPER."
    
    async def process_user_request(self, user_request: str) -> Dict[str, Any]:
        """Process a user request and orchestrate the response"""
        logger.info(f"Processing request: {user_request}")
        
        # Create task context
        task_context = {
            'request': user_request,
            'task_id': str(uuid.uuid4()),
            'created_at': datetime.utcnow().isoformat(),
            'available_agents': self._get_agent_status()
        }
        
        # Get orchestration plan from Claude
        orchestration_plan = await self._get_orchestration_plan(task_context)
        
        # Execute the plan
        results = await self._execute_plan(orchestration_plan)
        
        return {
            'task_id': task_context['task_id'],
            'plan': orchestration_plan,
            'results': results,
            'status': 'completed'
        }
    
    async def _get_orchestration_plan(self, context: Dict) -> Dict:
        """Use Claude to create an orchestration plan"""
        
        prompt = f"""
        Given this user request: {context['request']}
        
        Available agents:
        {json.dumps(context['available_agents'], indent=2)}
        
        Create a detailed orchestration plan including:
        1. Task breakdown with specific subtasks
        2. Agent assignments for each subtask
        3. Execution strategy (parallel/sequential/swarm)
        4. Dependencies between tasks
        5. Estimated time for completion
        
        Return the plan as a JSON structure.
        """
        
        response = self.claude.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=2000,
            system=self.system_prompt,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Parse the response and extract JSON plan
        plan_text = response.content[0].text
        
        # Extract JSON from the response (assuming it's properly formatted)
        import re
        json_match = re.search(r'```json\n(.*?)\n```', plan_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Fallback plan structure
        return {
            'strategy': 'sequential',
            'tasks': [
                {
                    'id': 'task-1',
                    'description': context['request'],
                    'agent': 'developer-1',
                    'dependencies': []
                }
            ],
            'estimated_time': 300
        }
    
    async def _execute_plan(self, plan: Dict) -> List[Dict]:
        """Execute the orchestration plan"""
        results = []
        
        # Determine execution strategy
        strategy = plan.get('strategy', 'sequential')
        
        if strategy == 'parallel':
            # Execute tasks in parallel
            tasks = []
            for task in plan['tasks']:
                if not task.get('dependencies'):
                    tasks.append(self._execute_task(task))
            
            results = await asyncio.gather(*tasks)
            
        elif strategy == 'swarm':
            # Spawn additional agents and distribute work
            await self._spawn_swarm(plan)
            results = await self._execute_swarm_tasks(plan)
            
        else:  # sequential
            # Execute tasks one by one
            for task in plan['tasks']:
                result = await self._execute_task(task)
                results.append(result)
        
        return results
    
    async def _execute_task(self, task: Dict) -> Dict:
        """Execute a single task on an agent"""
        agent_id = task['agent']
        agent = self.agents.get(agent_id)
        
        if not agent:
            logger.error(f"Agent {agent_id} not found")
            return {'error': f"Agent {agent_id} not found"}
        
        logger.info(f"Assigning task to {agent.name}: {task['description']}")
        
        # Create task in database
        task_record = self._create_task_record(task, agent_id)
        
        # Send task to agent via Redis
        task_message = {
            'task_id': task_record['id'],
            'description': task['description'],
            'context': task.get('context', {}),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.redis_client.publish(
            f'agent:{agent_id}:tasks',
            json.dumps(task_message)
        )
        
        # Execute in container (simplified for now)
        result = await self._execute_in_container(
            agent.container,
            task['description']
        )
        
        # Update task record
        self._update_task_record(task_record['id'], result)
        
        return result
    
    async def _execute_in_container(self, container: str, task_description: str) -> Dict:
        """Execute a task inside a container"""
        # For now, this is a simplified implementation
        # In production, this would use the actual Claude API inside the container
        
        cmd = [
            'docker', 'exec', container,
            'python3', '-c',
            f'print("Executing: {task_description}")'
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _spawn_swarm(self, plan: Dict):
        """Spawn additional agent instances for parallel execution"""
        required_agents = {}
        
        # Count required agents by type
        for task in plan['tasks']:
            agent_type = self.agents[task['agent']].role
            required_agents[agent_type] = required_agents.get(agent_type, 0) + 1
        
        # Spawn additional instances as needed
        for agent_type, count in required_agents.items():
            current_count = sum(1 for a in self.agents.values() if a.role == agent_type)
            spawn_count = min(count - current_count, self.max_spawn_per_type - current_count)
            
            for i in range(spawn_count):
                await self._spawn_agent(agent_type, i + current_count)
    
    async def _spawn_agent(self, agent_type: str, instance_num: int):
        """Spawn a new agent instance"""
        logger.info(f"Spawning {agent_type} instance {instance_num}")
        
        # This would use docker-compose scale or docker run
        # For now, it's a placeholder
        spawned_id = f"{agent_type}-spawned-{instance_num}"
        self.spawned_agents[spawned_id] = Agent(
            name=f"{agent_type.title()}-Spawned-{instance_num}",
            container=f"claude-{agent_type}-spawned-{instance_num}",
            role=agent_type,
            specialization='general'
        )
    
    def _get_agent_status(self) -> Dict:
        """Get current status of all agents"""
        status = {}
        for agent_id, agent in self.agents.items():
            status[agent_id] = {
                'name': agent.name,
                'role': agent.role,
                'specialization': agent.specialization,
                'status': agent.status,
                'container': agent.container
            }
        return status
    
    def _create_task_record(self, task: Dict, agent_id: str) -> Dict:
        """Create a task record in the database"""
        with self.db_conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO tasks (type, status, assigned_to, created_by, input_data)
                VALUES (%s, %s, 
                    (SELECT id FROM agents WHERE name = %s),
                    'policeman', %s)
                RETURNING *
            """, (
                'orchestrated_task',
                'assigned',
                agent_id,
                json.dumps(task)
            ))
            self.db_conn.commit()
            return cur.fetchone()
    
    def _update_task_record(self, task_id: str, result: Dict):
        """Update task record with results"""
        with self.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE tasks 
                SET status = %s, 
                    completed_at = CURRENT_TIMESTAMP,
                    output_data = %s
                WHERE id = %s
            """, (
                'completed' if result.get('success') else 'failed',
                json.dumps(result),
                task_id
            ))
            self.db_conn.commit()

async def main():
    """Main entry point"""
    orchestrator = PolicemanOrchestrator()
    
    # Example usage
    result = await orchestrator.process_user_request(
        "Create a simple React component for a login form"
    )
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())