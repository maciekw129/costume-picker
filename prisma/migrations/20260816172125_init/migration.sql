-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "costumeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Costume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Costume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Person_costumeId_key" ON "Person"("costumeId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_costumeId_fkey" FOREIGN KEY ("costumeId") REFERENCES "Costume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
