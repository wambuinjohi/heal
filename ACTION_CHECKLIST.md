# 🎯 Action Checklist - Dynamic Login Branding Setup

## Your Task (Choose One Path)

### Path A: SQL Policy (FASTEST - Do This First) ⚡
**Time Required: 2 minutes**

- [ ] Open your Supabase Dashboard
- [ ] Go to **SQL Editor** (left sidebar)
- [ ] Click **"New Query"** button
- [ ] Copy and paste this exactly:
```sql
CREATE POLICY "Public can read companies" ON companies
  FOR SELECT USING (true);
```
- [ ] Click the **Run** button (blue, on the right)
- [ ] See success message: "Policy created successfully"
- [ ] Refresh your browser (F5 or Cmd+R)
- [ ] Visit the login page
- [ ] ✅ See your company logo and name!

### Path B: Migration (For Production) 
**Time Required: 5-10 minutes**

- [ ] The migration file is already created: `supabase/migrations/20250131_allow_public_read_companies.sql`
- [ ] Commit and push your code
- [ ] Supabase will run the migration automatically
- [ ] Verify the policy was created (see Path A, Step 8)

---

## Prerequisites Check

Before doing the above, verify:

- [ ] **Company data exists**
  - Open Supabase Dashboard
  - Go to **Table Editor**
  - Click **companies** table
  - You should see at least one row
  - If no rows, create one with:
    - `name`: Your company name
    - `logo_url`: URL to your logo (optional)

---

## Verification Steps

After completing your chosen path:

1. [ ] Open browser DevTools (F12)
2. [ ] Go to **Console** tab
3. [ ] Should see no red errors
4. [ ] Refresh the login page
5. [ ] Check if you see:
   - [ ] Your company logo (in the colored box)
   - [ ] Your company name (as the main title)
   - [ ] Company name in footer (instead of ">> Medical Supplies")

---

## If Something's Wrong

### Console shows RLS error?
→ Did you run the SQL? Go back to Path A, Step 7

### Still seeing ">> Medical Supplies"?
→ Company data missing? Check Prerequisites above

### Logo broken/missing?
→ Is `logo_url` valid? Verify in Supabase Table Editor

### Need to hard refresh?
→ Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

---

## Files Changed (For Reference)

These files were created/modified to support this feature:

**New Files:**
- `src/services/companyService.ts`
- `src/hooks/usePublicCompany.ts`
- `supabase/supabase/functions/get-public-company/index.ts`
- `supabase/migrations/20250131_allow_public_read_companies.sql`

**Modified Files:**
- `src/components/auth/EnhancedLogin.tsx`
- `src/components/ui/biolegend-logo.tsx`

All changes are backward compatible and safe!

---

## Next Steps

Once you verify it's working:

1. **Update your company info anytime:**
   - Go to Supabase → Table Editor → companies
   - Edit `name` and `logo_url`
   - Refresh browser to see changes

2. **Deploy to production:**
   - Commit and push your code
   - Migrations will run automatically
   - Edge functions will be deployed

---

## Questions?

- **Full guide?** Read `DYNAMIC_LOGIN_COMPANY_SETUP.md`
- **Quick overview?** Read `QUICK_START_LOGIN_BRANDING.md`
- **Technical details?** Read `IMPLEMENTATION_SUMMARY.md`

---

## 💡 Summary

✅ **Code is ready**
⏳ **Just need to enable RLS policy** (Path A: 2 minutes)
🎉 **Then your login page shows your company branding**

**Let me know once you complete the SQL step and I can help if there are any issues!**
