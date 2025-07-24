#!/usr/bin/env python3
"""
Generate a visual system architecture diagram for Claude Swarm Docker Platform
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(16, 12))
ax.set_xlim(0, 16)
ax.set_ylim(0, 12)
ax.axis('off')

# Color scheme
colors = {
    'container': '#E3F2FD',
    'container_border': '#1976D2',
    'storage': '#E8F5E9',
    'storage_border': '#388E3C',
    'service': '#FFF3E0',
    'service_border': '#F57C00',
    'network': '#F3E5F5',
    'network_border': '#7B1FA2',
    'host': '#ECEFF1',
    'host_border': '#455A64'
}

# Helper function to draw a container box
def draw_container(ax, x, y, width, height, title, details, color='container'):
    # Main box
    box = FancyBboxPatch(
        (x, y), width, height,
        boxstyle="round,pad=0.1",
        facecolor=colors[color],
        edgecolor=colors[f'{color}_border'],
        linewidth=2
    )
    ax.add_patch(box)
    
    # Title
    ax.text(x + width/2, y + height - 0.3, title,
            ha='center', va='center', fontsize=12, fontweight='bold')
    
    # Details
    for i, detail in enumerate(details):
        ax.text(x + width/2, y + height - 0.8 - (i * 0.3), detail,
                ha='center', va='center', fontsize=9)
    
    return box

# Draw host machine
host_box = FancyBboxPatch(
    (0.5, 0.5), 15, 11,
    boxstyle="round,pad=0.1",
    facecolor=colors['host'],
    edgecolor=colors['host_border'],
    linewidth=3
)
ax.add_patch(host_box)
ax.text(8, 11.2, 'Host Machine (Windows + WSL2)', 
        ha='center', va='center', fontsize=14, fontweight='bold')

# Draw Docker network
network_box = FancyBboxPatch(
    (1, 1), 14, 9,
    boxstyle="round,pad=0.1",
    facecolor=colors['network'],
    edgecolor=colors['network_border'],
    linewidth=2,
    alpha=0.3
)
ax.add_patch(network_box)
ax.text(8, 9.7, 'Docker Network: claude-net', 
        ha='center', va='center', fontsize=12, fontweight='bold')

# Draw containers
containers = [
    # Policeman (Orchestrator)
    {'x': 2, 'y': 6.5, 'w': 3, 'h': 2.5, 'title': 'Policeman Container',
     'details': ['Ubuntu 22.04', 'Orchestrator', 'Port: 8080', 'Python 3.11, Node.js 20']},
    
    # Developer 1
    {'x': 6, 'y': 7.5, 'w': 3, 'h': 2, 'title': 'Developer-1',
     'details': ['Ubuntu 22.04', 'Code Agent', 'Python, Node.js', 'Anthropic SDK']},
    
    # Developer 2
    {'x': 6, 'y': 5, 'w': 3, 'h': 2, 'title': 'Developer-2',
     'details': ['Ubuntu 22.04', 'Code Agent', 'Python, Node.js', 'Anthropic SDK']},
    
    # Tester
    {'x': 10, 'y': 6.5, 'w': 3, 'h': 2.5, 'title': 'Tester',
     'details': ['Ubuntu 22.04', 'Test Agent', 'Testing Tools', 'Validation']},
]

# Draw storage containers
storage = [
    # Redis
    {'x': 2, 'y': 2.5, 'w': 3, 'h': 1.5, 'title': 'Redis',
     'details': ['Message Bus', 'Port: 6379'], 'color': 'storage'},
    
    # PostgreSQL
    {'x': 6, 'y': 2.5, 'w': 3, 'h': 1.5, 'title': 'PostgreSQL',
     'details': ['State Storage', 'Port: 5432'], 'color': 'storage'},
    
    # Dashboard
    {'x': 10, 'y': 2.5, 'w': 3, 'h': 1.5, 'title': 'Dashboard',
     'details': ['Nginx', 'Port: 3000'], 'color': 'service'},
]

# Draw all containers
for cont in containers:
    draw_container(ax, cont['x'], cont['y'], cont['w'], cont['h'], 
                  cont['title'], cont['details'])

for stor in storage:
    draw_container(ax, stor['x'], stor['y'], stor['w'], stor['h'], 
                  stor['title'], stor['details'], stor['color'])

# Draw SSH container (outside main network)
ssh_box = draw_container(ax, 11.5, 10.2, 3, 1.2, 'SSH Container',
                        ['Ubuntu 22.04', 'Port: 2222'], 'service')

# Draw connections
# Policeman to Developers/Tester
ax.annotate('', xy=(6.5, 8), xytext=(4.5, 8),
            arrowprops=dict(arrowstyle='->', lw=2, color='blue', alpha=0.6))
ax.annotate('', xy=(6.5, 6), xytext=(4.5, 7),
            arrowprops=dict(arrowstyle='->', lw=2, color='blue', alpha=0.6))
ax.annotate('', xy=(10, 7.5), xytext=(5, 7.5),
            arrowprops=dict(arrowstyle='->', lw=2, color='blue', alpha=0.6))

# All to Redis (Pub/Sub)
for x, y in [(3.5, 6.5), (7.5, 5), (7.5, 7.5), (11.5, 6.5)]:
    ax.annotate('', xy=(3.5, 4), xytext=(x, y),
                arrowprops=dict(arrowstyle='<->', lw=1.5, color='red', alpha=0.5))

# All to PostgreSQL (State)
for x, y in [(3.5, 6.5), (7.5, 5), (7.5, 7.5), (11.5, 6.5)]:
    ax.annotate('', xy=(7.5, 4), xytext=(x, y),
                arrowprops=dict(arrowstyle='->', lw=1.5, color='green', alpha=0.5))

# Dashboard connections
ax.annotate('', xy=(11.5, 4), xytext=(8.5, 3.5),
            arrowprops=dict(arrowstyle='->', lw=1.5, color='orange', alpha=0.5))

# Add labels
ax.text(5.5, 8.5, 'Orchestrates', ha='center', fontsize=8, color='blue')
ax.text(2.5, 5, 'Pub/Sub', ha='center', fontsize=8, color='red', rotation=70)
ax.text(8.5, 5, 'State', ha='center', fontsize=8, color='green', rotation=70)

# Add legend
legend_elements = [
    patches.Patch(color=colors['container'], label='Agent Container'),
    patches.Patch(color=colors['storage'], label='Storage Service'),
    patches.Patch(color=colors['service'], label='Web Service'),
    patches.Patch(color='blue', alpha=0.6, label='Orchestration'),
    patches.Patch(color='red', alpha=0.5, label='Message Bus'),
    patches.Patch(color='green', alpha=0.5, label='Data Storage')
]
ax.legend(handles=legend_elements, loc='lower right', bbox_to_anchor=(0.98, 0.02))

# Add title
plt.title('Claude Swarm Docker Platform - System Architecture\n"Each agent runs in its own isolated Ubuntu container"', 
          fontsize=16, fontweight='bold', pad=20)

# Add annotations
ax.text(8, 0.2, '• Each container is completely isolated with its own filesystem, processes, and network\n' +
               '• Containers communicate through Redis (pub/sub) and PostgreSQL (shared state)\n' +
               '• Easy to scale by adding more developer or tester containers',
        ha='center', va='center', fontsize=10, style='italic',
        bbox=dict(boxstyle="round,pad=0.5", facecolor='lightyellow', alpha=0.8))

# Save the diagram
plt.tight_layout()
plt.savefig('/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/system-architecture-diagram.png', 
            dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig('/mnt/c/Users/colin/Documents-local/91_Claude-Code/claude-swarm-docker-spawn/system-architecture-diagram.pdf', 
            bbox_inches='tight', facecolor='white')

print("System architecture diagram created:")
print("- system-architecture-diagram.png")
print("- system-architecture-diagram.pdf")