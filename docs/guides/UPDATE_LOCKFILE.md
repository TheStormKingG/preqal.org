# Update package-lock.json

The package-lock.json needs to be updated to include the new jspdf dependencies.

## Steps:

1. **Update the lock file:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Commit the updated lock file:**
   ```bash
   git add package-lock.json
   git commit -m "Update package-lock.json with jspdf dependencies"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin master
   ```

This will fix the CI/CD build error.
