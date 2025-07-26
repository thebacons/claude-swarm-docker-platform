#!/usr/bin/env python3
import subprocess
import concurrent.futures
import json
from datetime import datetime

# Container configurations
containers = {
    "policeman": {"port": 2222, "status": "Not Running"},
    "developer-1": {"port": 2223, "status": "Unknown"},
    "developer-2": {"port": 2224, "status": "Unknown"},
    "tester": {"port": 2225, "status": "Unknown"}
}

def test_container_direct(name, config):
    """Test container using docker exec instead of SSH"""
    result = {
        "name": name,
        "port": config["port"],
        "timestamp": datetime.now().isoformat(),
        "connection": "N/A (using docker exec)",
        "claude_code": "Not Found",
        "agent_role": "Not Found",
        "python_version": "Not Found",
        "container_hostname": "Unknown"
    }
    
    # Skip policeman as it's not running
    if name == "policeman":
        result["error"] = "Container not running"
        return result
    
    try:
        # Get container hostname
        hostname_cmd = f"docker exec casper-{name} hostname"
        hostname_result = subprocess.run(hostname_cmd, shell=True, capture_output=True, text=True, timeout=5)
        if hostname_result.returncode == 0:
            result["container_hostname"] = hostname_result.stdout.strip()
        
        # Test Claude Code
        claude_cmd = f"docker exec casper-{name} claude --version"
        claude_result = subprocess.run(claude_cmd, shell=True, capture_output=True, text=True, timeout=5)
        if claude_result.returncode == 0:
            result["claude_code"] = claude_result.stdout.strip()
        
        # Check for agent role
        role_cmd = f"docker exec casper-{name} cat /home/claude/agent-role.txt"
        role_result = subprocess.run(role_cmd, shell=True, capture_output=True, text=True, timeout=5)
        if role_result.returncode == 0:
            result["agent_role"] = role_result.stdout.strip()
        else:
            # Try to find any specialization info
            spec_cmd = f"docker exec casper-{name} ls /home/claude/.claude/agent-config.json"
            spec_result = subprocess.run(spec_cmd, shell=True, capture_output=True, text=True, timeout=5)
            if spec_result.returncode == 0:
                result["agent_role"] = "Config file exists at .claude/agent-config.json"
        
        # Check Python version
        python_cmd = f"docker exec casper-{name} python3 --version"
        python_result = subprocess.run(python_cmd, shell=True, capture_output=True, text=True, timeout=5)
        if python_result.returncode == 0:
            result["python_version"] = python_result.stdout.strip()
        
        result["status"] = "Running"
        
    except subprocess.TimeoutExpired:
        result["error"] = "Command timed out"
    except Exception as e:
        result["error"] = str(e)
    
    return result

def main():
    print("=== CASPER Container Connectivity Test ===")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nTesting all containers in parallel...\n")
    
    # Run tests in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_container = {
            executor.submit(test_container_direct, name, config): name 
            for name, config in containers.items()
        }
        
        results = []
        for future in concurrent.futures.as_completed(future_to_container):
            container_name = future_to_container[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as exc:
                results.append({
                    "name": container_name,
                    "error": f"Test failed: {exc}"
                })
    
    # Sort results by container name for consistent output
    results.sort(key=lambda x: x["name"])
    
    # Display results
    print("=== Test Results ===\n")
    for result in results:
        print(f"Container: {result['name'].upper()}")
        print(f"  Port: {result.get('port', 'N/A')}")
        print(f"  Hostname: {result.get('container_hostname', 'Unknown')}")
        print(f"  Status: {result.get('status', 'Unknown')}")
        print(f"  Claude Code: {result.get('claude_code', 'Not Found')}")
        print(f"  Agent Role: {result.get('agent_role', 'Not Found')}")
        print(f"  Python: {result.get('python_version', 'Not Found')}")
        if 'error' in result:
            print(f"  Error: {result['error']}")
        print()
    
    # Summary
    running_count = sum(1 for r in results if r.get('status') == 'Running')
    claude_count = sum(1 for r in results if 'Not Found' not in r.get('claude_code', 'Not Found'))
    
    print("=== Summary ===")
    print(f"Total containers tested: {len(results)}")
    print(f"Running containers: {running_count}")
    print(f"Containers with Claude Code: {claude_count}")
    
    # Save results to JSON
    output_file = "casper_container_test_results.json"
    with open(output_file, 'w') as f:
        json.dump({
            "test_timestamp": datetime.now().isoformat(),
            "results": results,
            "summary": {
                "total_tested": len(results),
                "running": running_count,
                "with_claude_code": claude_count
            }
        }, f, indent=2)
    print(f"\nDetailed results saved to: {output_file}")

if __name__ == "__main__":
    main()