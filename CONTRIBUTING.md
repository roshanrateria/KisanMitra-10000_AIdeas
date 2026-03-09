# Contributing to KisanMitra

First off, thank you for considering contributing to KisanMitra! It's people like you that make KisanMitra such a great tool for Indian farmers.

## 🌾 Our Mission

KisanMitra aims to empower Indian farmers with AI-driven sustainable agriculture. Every contribution helps us achieve this mission.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## 💻 Development Setup

1. Clone your fork:
```bash
git clone https://github.com/your-username/kisanmitra.git
cd kisanmitra
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Add your API keys
```

4. Start development server:
```bash
npm run dev
```

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer functional components and hooks

### React Components

- One component per file
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the existing folder structure

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing and colors
- Use Shadcn/UI components when possible

### Commit Messages

Follow the conventional commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add crop rotation recommendations
fix: resolve weather API timeout issue
docs: update installation instructions
```

## 🌐 Translation Contributions

We welcome translations to more Indian languages!

1. Check existing translations in `src/lib/translations.ts`
2. Add your language code and translations
3. Test the translation in the UI
4. Submit a PR with screenshots

## 🧪 Testing

- Test your changes in multiple browsers
- Test on mobile devices
- Verify all API integrations work
- Check for console errors
- Test with different user scenarios

## 📚 Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Update API documentation if needed
- Include examples in documentation

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Report security vulnerabilities privately
- Follow secure coding practices

## 🎯 Priority Areas

We especially welcome contributions in these areas:

1. **Mobile Optimization**: Improve mobile user experience
2. **Offline Support**: Add offline functionality
3. **Performance**: Optimize loading times and rendering
4. **Accessibility**: Improve screen reader support
5. **Testing**: Add unit and integration tests
6. **Documentation**: Improve guides and tutorials
7. **Translations**: Add more Indian languages
8. **Features**: Implement items from the roadmap

## 📞 Questions?

- Open an issue with the `question` label
- Join our community discussions
- Check existing documentation

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to KisanMitra! Together, we're making a difference in Indian agriculture. 🌾
