# Development Workflow - Best Practices

## ✅ Correct Development Process

### 1. Develop
- Write code/make changes
- Save files locally

### 2. Test Locally (BEFORE committing!)
```bash
# For Docker changes
docker-compose -f docker-compose.enhanced.yml build
docker-compose -f docker-compose.enhanced.yml up -d
./test-container-hooks.sh

# For other code
npm test           # If applicable
python test.py     # If applicable
./run-tests.sh     # Project specific
```

### 3. Verify Functionality
- Run TUT (Technical Unit Tests)
- Run FUT (Functional Unit Tests)
- Check for breaking changes
- Ensure no regression

### 4. Only After Tests Pass
```bash
git add .
git commit -m "feat: Description of working feature"
git push origin feature/branch-name
```

## 🚫 What We Did Wrong

We committed and pushed BEFORE testing:
1. ❌ Created enhanced Docker files
2. ❌ Committed immediately
3. ❌ Pushed to GitHub
4. ❌ THEN planned to test

This could push broken code to the repository!

## 🔄 How to Fix When This Happens

### Option 1: Test and Fix (if needed)
```bash
# Test the current code
./build-enhanced.sh

# If issues found, fix them
# Then create a fix commit
git add .
git commit -m "fix: Correct issues found in testing"
git push
```

### Option 2: Revert if Severely Broken
```bash
# Revert the last commit locally
git revert HEAD

# Or reset if not pushed yet (but we already pushed)
# git reset --soft HEAD~1

# Push the revert
git push
```

## 📋 Testing Checklist for This Project

Before ANY commit:

### Docker Changes
- [ ] Docker build succeeds
- [ ] Containers start without errors
- [ ] Health checks pass
- [ ] Hooks work inside containers
- [ ] Volume mounts are correct
- [ ] Network connectivity works

### Code Changes
- [ ] Syntax is valid
- [ ] No import errors
- [ ] Functions work as expected
- [ ] Error handling works
- [ ] Edge cases handled

### Integration
- [ ] Components work together
- [ ] No breaking changes
- [ ] Backward compatibility maintained
- [ ] Documentation updated

## 🎯 Correct Workflow Going Forward

1. **Make changes**
2. **Test locally** 
3. **Fix any issues**
4. **Test again**
5. **Only when all tests pass:**
   - Stage changes (git add)
   - Commit with descriptive message
   - Push to feature branch
   - Create PR for review

## 💡 Testing Commands for Current Work

```bash
# Test the Docker build
docker-compose -f docker-compose.enhanced.yml build

# If successful, start services
docker-compose -f docker-compose.enhanced.yml up -d

# Check status
docker-compose -f docker-compose.enhanced.yml ps

# Run health checks
docker exec claude-policeman /workspace/scripts/health-check.sh

# Test hook system
./test-container-hooks.sh

# Check logs for errors
docker-compose -f docker-compose.enhanced.yml logs

# Clean up after testing
docker-compose -f docker-compose.enhanced.yml down
```

## 📝 Note for Future Development

**ALWAYS follow: Develop → Test → Fix → Test → Commit → Push**

Never skip the testing phase, even for "simple" changes!