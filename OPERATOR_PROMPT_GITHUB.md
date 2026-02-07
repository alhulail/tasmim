# ChatGPT Operator Prompt - Create GitHub Repository

## TASK: Create a new GitHub repository for Tasmim.ai

### STEP 1: Create Repository

1. Go to https://github.com/new
2. Fill in the form:
   - Repository name: `tasmim`
   - Description: `AI-powered logo and brand asset generation for Arabic/English brands`
   - Keep it **Public** (or Private if preferred)
   - Do NOT initialize with README, .gitignore, or license (leave all unchecked)
3. Click "Create repository"

### STEP 2: Copy the Repository URL

After creation, you'll see a Quick Setup page. Copy the HTTPS URL shown, which will look like:
```
https://github.com/USERNAME/tasmim.git
```

Tell me this URL so the user can push their code.

### STEP 3: Instructions for User

Tell the user to run these commands in their terminal (in the tasmim folder):

```bash
git init
git add .
git commit -m "Initial commit - Tasmim.ai MVP"
git branch -M main
git remote add origin https://github.com/USERNAME/tasmim.git
git push -u origin main
```

Replace USERNAME with their actual GitHub username.

---

## CONFIRMATION

When complete, confirm:
✅ Repository created at github.com/USERNAME/tasmim
✅ Repository URL provided to user
✅ Git commands provided to user
