-- CreateIndex
CREATE INDEX "Expense_year_period_idx" ON "Expense"("year", "period");

-- CreateIndex
CREATE INDEX "Expense_createdAt_idx" ON "Expense"("createdAt");

-- CreateIndex
CREATE INDEX "ThrBonus_year_period_idx" ON "ThrBonus"("year", "period");

-- CreateIndex
CREATE INDEX "Wishlist_isActive_idx" ON "Wishlist"("isActive");

-- CreateIndex
CREATE INDEX "Wishlist_targetPeriod_idx" ON "Wishlist"("targetPeriod");
