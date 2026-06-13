-- CreateIndex
CREATE INDEX "payments_installment_id_idx" ON "payments"("installment_id");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");
