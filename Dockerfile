# Claude Swarm Docker Container
FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    sudo \
    wget \
    build-essential \
    software-properties-common \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Ruby 3.x
RUN apt-get update && apt-get install -y \
    ruby-full \
    ruby-dev \
    && gem install bundler

# Note: Claude Code CLI must be installed manually as it's not available via npm
# The container will need Claude Code installed via the official method

# Create non-root user
RUN useradd -m -s /bin/bash developer \
    && echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set up workspace
WORKDIR /workspace
RUN mkdir -p projects configs logs sessions \
    && chown -R developer:developer /workspace

# Switch to non-root user
USER developer

# Set environment variables
ENV PATH="/home/developer/.local/bin:${PATH}"
ENV CLAUDE_HOME="/home/developer/.claude"

# Copy configuration files
COPY --chown=developer:developer configs/ /workspace/configs/
COPY --chown=developer:developer *.sh /workspace/

# Note: Scripts will be made executable at runtime

# Default command
CMD ["/bin/bash"]