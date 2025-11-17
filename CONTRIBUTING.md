# Contributing to Calculation Tree

Thank you for your interest in contributing to Calculation Tree! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Maintain professionalism

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/calculation-tree.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit and push
7. Create a Pull Request

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start:
```bash
npm install
npm run dev
```

## Project Structure

- `backend/` - Node.js + TypeScript backend
- `frontend/` - React + TypeScript frontend
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture

## Coding Standards

### TypeScript
- Use strict type checking
- Avoid `any` type
- Use interfaces for object types
- Use enums for fixed sets of values

### React
- Use functional components with hooks
- Use TypeScript for props
- Keep components small and focused
- Use meaningful component names

### Backend
- Use async/await for asynchronous operations
- Use parameterized queries for database
- Validate all inputs
- Handle errors properly

### General
- Write self-documenting code
- Add comments for complex logic
- Follow existing code style
- Keep functions small and focused

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(backend): add user profile endpoint
fix(frontend): resolve calculation tree rendering issue
docs: update API documentation
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Writing Tests

- Write tests for new features
- Maintain or improve coverage
- Test edge cases
- Use descriptive test names

## Pull Request Process

1. **Update Documentation**: Update README, API docs, etc. if needed
2. **Add Tests**: Include tests for new functionality
3. **Check Lints**: Ensure no linting errors
4. **Update CHANGELOG**: Add entry for significant changes
5. **Describe Changes**: Provide clear PR description

### PR Title Format

```
[Type] Brief description
```

Examples:
- `[Feature] Add calculation search functionality`
- `[Fix] Resolve division by zero error`
- `[Docs] Update setup instructions`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Commits follow convention
```

## Code Review

All submissions require review. Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Performance impact
- Security considerations

## Bug Reports

Use GitHub Issues with the following information:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 12]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.10.0]

**Screenshots**
If applicable
```

## Feature Requests

Use GitHub Issues with the following information:

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Any other relevant information
```

## Development Workflow

1. **Create Issue**: Discuss feature/bug before coding
2. **Create Branch**: Use descriptive branch name
3. **Develop**: Write code following standards
4. **Test**: Ensure tests pass
5. **Commit**: Use conventional commits
6. **Push**: Push to your fork
7. **PR**: Create pull request
8. **Review**: Address review feedback
9. **Merge**: Maintainer will merge

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test changes

## Questions?

- Check existing documentation
- Search existing issues
- Create new issue for questions
- Be patient and respectful

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Calculation Tree! 🌳

