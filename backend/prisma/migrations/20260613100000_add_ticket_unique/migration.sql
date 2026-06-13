-- CreateIndex
CREATE UNIQUE INDEX "memberships_chit_plan_id_ticket_number_key" ON "memberships"("chit_plan_id", "ticket_number");
