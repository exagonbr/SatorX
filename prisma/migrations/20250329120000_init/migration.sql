-- CreateTable
CREATE TABLE "td_learning" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" TEXT NOT NULL,
    "td_error" REAL,
    "v_before" REAL,
    "v_after" REAL,
    "td_target" REAL,
    "terminal" INTEGER NOT NULL,
    "outcome_for_mover" INTEGER NOT NULL,
    "updates" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "nn_weights_snapshots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" TEXT NOT NULL,
    "updates" INTEGER NOT NULL,
    "payload" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "idx_td_learning_created" ON "td_learning"("created_at");

-- CreateIndex
CREATE INDEX "idx_nn_snapshots_updates" ON "nn_weights_snapshots"("updates");
