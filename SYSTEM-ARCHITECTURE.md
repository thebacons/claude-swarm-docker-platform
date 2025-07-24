# Claude Swarm Docker Platform - System Architecture

## Overview
Yes, each developer (1, 2, 3) runs in its **own separate Ubuntu 22.04 container**. Each container is completely isolated with its own:
- File system
- Process space
- Network interface
- Memory allocation
- CPU allocation

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Host Machine (Windows + WSL2)"
        subgraph "Docker Desktop"
            subgraph "Docker Network: claude-net"
                subgraph "Policeman Container"
                    P[Ubuntu 22.04<br/>Role: Orchestrator<br/>Port: 8080]
                    P1[Python 3.11]
                    P2[Node.js 20]
                    P3[Anthropic SDK]
                    P4[Hooks System]
                end
                
                subgraph "Developer-1 Container"
                    D1[Ubuntu 22.04<br/>Role: Code Agent<br/>Internal: 8080]
                    D1A[Python 3.11]
                    D1B[Node.js 20]
                    D1C[Anthropic SDK]
                    D1D[Development Tools]
                end
                
                subgraph "Developer-2 Container"
                    D2[Ubuntu 22.04<br/>Role: Code Agent<br/>Internal: 8080]
                    D2A[Python 3.11]
                    D2B[Node.js 20]
                    D2C[Anthropic SDK]
                    D2D[Development Tools]
                end
                
                subgraph "Tester Container"
                    T[Ubuntu 22.04<br/>Role: Test Agent<br/>Internal: 8080]
                    T1[Python 3.11]
                    T2[Node.js 20]
                    T3[Anthropic SDK]
                    T4[Testing Tools]
                end
                
                subgraph "Redis Container"
                    R[Redis 7 Alpine<br/>Port: 6379<br/>Message Bus]
                end
                
                subgraph "PostgreSQL Container"
                    PG[PostgreSQL 15<br/>Port: 5432<br/>State Storage]
                end
                
                subgraph "Dashboard Container"
                    DASH[Nginx Alpine<br/>Port: 3000<br/>Web UI]
                end
            end
        end
        
        SSH[SSH Container<br/>Ubuntu 22.04<br/>Port: 2222]
    end
    
    %% Connections
    P -.->|Orchestrates| D1
    P -.->|Orchestrates| D2
    P -.->|Orchestrates| T
    
    D1 <-->|Pub/Sub| R
    D2 <-->|Pub/Sub| R
    T <-->|Pub/Sub| R
    P <-->|Pub/Sub| R
    
    P -->|Stores State| PG
    D1 -->|Logs Results| PG
    D2 -->|Logs Results| PG
    T -->|Logs Results| PG
    
    DASH -->|Queries| PG
    DASH -->|Monitors| R
    
    SSH -.->|Optional Access| P
    
    classDef container fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef service fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef storage fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    
    class P,D1,D2,T,SSH container
    class R,PG storage
    class DASH service
```

## Container Details

### 1. **Policeman Container** (Orchestrator)
- **OS**: Ubuntu 22.04
- **Role**: Central coordinator, task distribution, validation
- **Exposed Port**: 8080 (Web UI)
- **Resources**: 2 CPU cores, 2GB RAM
- **Special Features**: Hook validation system

### 2. **Developer-1 Container**
- **OS**: Ubuntu 22.04
- **Role**: Primary development agent
- **Internal Port**: 8080 (not exposed)
- **Resources**: 2 CPU cores, 2GB RAM
- **Workspace**: `/workspace/projects`

### 3. **Developer-2 Container**
- **OS**: Ubuntu 22.04
- **Role**: Secondary development agent
- **Internal Port**: 8080 (not exposed)
- **Resources**: 2 CPU cores, 2GB RAM
- **Workspace**: `/workspace/projects`

### 4. **Tester Container**
- **OS**: Ubuntu 22.04
- **Role**: Testing and validation
- **Internal Port**: 8080 (not exposed)
- **Resources**: 1 CPU core, 1GB RAM
- **Workspace**: `/workspace/projects`

## Communication Flow

```mermaid
sequenceDiagram
    participant User
    participant Policeman
    participant Redis
    participant Dev1
    participant Dev2
    participant Tester
    participant PostgreSQL
    
    User->>Policeman: Submit Task
    Policeman->>PostgreSQL: Create Task Record
    Policeman->>Redis: Publish Task Assignment
    
    par Parallel Execution
        Redis->>Dev1: Receive Task
        Dev1->>Dev1: Execute Code Generation
        Dev1->>Redis: Publish Progress
    and
        Redis->>Dev2: Receive Task
        Dev2->>Dev2: Execute Code Generation
        Dev2->>Redis: Publish Progress
    end
    
    Redis->>Tester: Code Ready for Testing
    Tester->>Tester: Run Tests
    Tester->>PostgreSQL: Store Test Results
    Tester->>Redis: Publish Test Results
    
    Redis->>Policeman: Aggregate Results
    Policeman->>PostgreSQL: Update Task Status
    Policeman->>User: Return Results
```

## Resource Isolation

Each container has:
- **Isolated File System**: Each container has its own root filesystem
- **Process Isolation**: Processes in one container cannot see processes in another
- **Network Isolation**: Each container has its own network namespace
- **Resource Limits**: CPU and memory limits enforced by Docker

## Shared Resources

### Volumes (Persistent Storage)
```yaml
volumes:
  - ./projects:/workspace/projects      # Shared project files
  - ./hooks:/workspace/hooks:ro         # Read-only hooks
  - policeman-claude:/home/developer/.claude  # Isolated Claude config
```

### Network
- All containers on same Docker network (`claude-net`)
- Can communicate using container names as hostnames
- Example: Dev1 can reach Redis at `claude-redis:6379`

## Scaling Model

```mermaid
graph LR
    subgraph "Current Setup"
        P1[Policeman]
        D1[Developer-1]
        D2[Developer-2]
        T1[Tester]
    end
    
    subgraph "Scaled Setup"
        P2[Policeman]
        D3[Developer-1]
        D4[Developer-2]
        D5[Developer-3]
        D6[Developer-4]
        D7[Developer-5]
        T2[Tester-1]
        T3[Tester-2]
    end
    
    P1 -->|Scale Out| P2
    D1 -->|Replicate| D3
    D2 -->|Replicate| D4
    T1 -->|Replicate| T2
    
    style D5 fill:#90caf9
    style D6 fill:#90caf9
    style D7 fill:#90caf9
    style T3 fill:#a5d6a7
```

## Container Management Commands

```bash
# View all containers
docker ps -a

# Access specific container
docker exec -it claude-developer-1 /bin/bash
docker exec -it claude-developer-2 /bin/bash
docker exec -it claude-tester /bin/bash

# View resource usage
docker stats

# Scale up (add more developers)
docker compose -f docker-compose.enhanced.yml up -d --scale developer=5

# View logs from specific container
docker logs -f claude-developer-1
```

## Security & Isolation

1. **Container Isolation**: Each container runs in its own namespace
2. **User Isolation**: Running as non-root user (`developer`)
3. **Network Security**: Internal network not exposed to host
4. **Resource Limits**: Prevents one container from consuming all resources

## Summary

- **Yes**, each developer runs in its own Ubuntu 22.04 container
- Containers are **completely isolated** from each other
- They communicate through **Redis** (pub/sub) and **PostgreSQL** (shared state)
- The **Policeman** orchestrates all agents
- You can SSH into any container or use `docker exec`
- Easy to scale by adding more containers