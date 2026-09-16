-- CreateTable
CREATE TABLE "WorkoutTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'emerald',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WorkoutSessionToWorkoutTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutTag_normalizedName_key" ON "WorkoutTag"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "_WorkoutSessionToWorkoutTag_AB_unique" ON "_WorkoutSessionToWorkoutTag"("A", "B");

-- CreateIndex
CREATE INDEX "_WorkoutSessionToWorkoutTag_B_index" ON "_WorkoutSessionToWorkoutTag"("B");

-- AddForeignKey
ALTER TABLE "_WorkoutSessionToWorkoutTag" ADD CONSTRAINT "_WorkoutSessionToWorkoutTag_A_fkey" FOREIGN KEY ("A") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkoutSessionToWorkoutTag" ADD CONSTRAINT "_WorkoutSessionToWorkoutTag_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkoutTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
