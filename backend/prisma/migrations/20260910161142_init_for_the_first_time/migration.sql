-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "passwordHash" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "level" TEXT,
    "theme" TEXT DEFAULT 'dark',
    "language" TEXT DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnownTechnology" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bricId" INTEGER NOT NULL,
    "addingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnownTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "projectSize" TEXT,
    "extractedNeeds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificConstraint" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "constraint" TEXT,

    CONSTRAINT "SpecificConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bric" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "requiredLevel" TEXT NOT NULL,
    "technicalDeptRisk" TEXT NOT NULL,
    "maintenanceScore" INTEGER NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "popularityScore" INTEGER NOT NULL,
    "maintenaceActivity" INTEGER NOT NULL,
    "communitySize" INTEGER NOT NULL,
    "lastUpdate" TIMESTAMP(3),
    "infrastructurePrice" TEXT NOT NULL,
    "licence" TEXT NOT NULL,
    "ressources" JSONB,

    CONSTRAINT "Bric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompatibleProject" (
    "id" SERIAL NOT NULL,
    "bricId" INTEGER NOT NULL,
    "projectType" TEXT NOT NULL,

    CONSTRAINT "CompatibleProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodFor" (
    "id" SERIAL NOT NULL,
    "bricId" INTEGER NOT NULL,
    "projectType" TEXT NOT NULL,

    CONSTRAINT "GoodFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadFor" (
    "id" SERIAL NOT NULL,
    "bricId" INTEGER NOT NULL,
    "projectType" TEXT NOT NULL,

    CONSTRAINT "BadFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compatibility" (
    "id" SERIAL NOT NULL,
    "bricAId" INTEGER NOT NULL,
    "bricBId" INTEGER NOT NULL,
    "typeRelation" TEXT NOT NULL,

    CONSTRAINT "Compatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposedStack" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "firingMessageId" INTEGER NOT NULL,
    "FinalScore" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposedStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StackBric" (
    "id" SERIAL NOT NULL,
    "bricId" INTEGER NOT NULL,
    "stackId" INTEGER NOT NULL,

    CONSTRAINT "StackBric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChoosenStack" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "stackId" INTEGER NOT NULL,
    "choiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChoosenStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livrable" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Livrable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bricId" INTEGER,
    "stackId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedBack" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "Message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedBack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_sessionId_key" ON "user"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_sessionId_idx" ON "user"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "KnownTechnology_userId_bricId_key" ON "KnownTechnology"("userId", "bricId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "SpecificConstraint_conversationId_idx" ON "SpecificConstraint"("conversationId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Bric_name_key" ON "Bric"("name");

-- CreateIndex
CREATE INDEX "Bric_category_idx" ON "Bric"("category");

-- CreateIndex
CREATE INDEX "CompatibleProject_bricId_idx" ON "CompatibleProject"("bricId");

-- CreateIndex
CREATE INDEX "GoodFor_bricId_idx" ON "GoodFor"("bricId");

-- CreateIndex
CREATE INDEX "BadFor_bricId_idx" ON "BadFor"("bricId");

-- CreateIndex
CREATE UNIQUE INDEX "Compatibility_bricAId_bricBId_key" ON "Compatibility"("bricAId", "bricBId");

-- CreateIndex
CREATE INDEX "ProposedStack_conversationId_version_idx" ON "ProposedStack"("conversationId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "StackBric_stackId_bricId_key" ON "StackBric"("stackId", "bricId");

-- CreateIndex
CREATE INDEX "Livrable_conversationId_idx" ON "Livrable"("conversationId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- AddForeignKey
ALTER TABLE "KnownTechnology" ADD CONSTRAINT "KnownTechnology_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnownTechnology" ADD CONSTRAINT "KnownTechnology_bricId_fkey" FOREIGN KEY ("bricId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificConstraint" ADD CONSTRAINT "SpecificConstraint_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibleProject" ADD CONSTRAINT "CompatibleProject_bricId_fkey" FOREIGN KEY ("bricId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodFor" ADD CONSTRAINT "GoodFor_bricId_fkey" FOREIGN KEY ("bricId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BadFor" ADD CONSTRAINT "BadFor_bricId_fkey" FOREIGN KEY ("bricId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compatibility" ADD CONSTRAINT "Compatibility_bricAId_fkey" FOREIGN KEY ("bricAId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compatibility" ADD CONSTRAINT "Compatibility_bricBId_fkey" FOREIGN KEY ("bricBId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposedStack" ADD CONSTRAINT "ProposedStack_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposedStack" ADD CONSTRAINT "ProposedStack_firingMessageId_fkey" FOREIGN KEY ("firingMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackBric" ADD CONSTRAINT "StackBric_bricId_fkey" FOREIGN KEY ("bricId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackBric" ADD CONSTRAINT "StackBric_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "ProposedStack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoosenStack" ADD CONSTRAINT "ChoosenStack_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoosenStack" ADD CONSTRAINT "ChoosenStack_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "ProposedStack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livrable" ADD CONSTRAINT "Livrable_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_bricId_fkey" FOREIGN KEY ("bricId") REFERENCES "Bric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "ProposedStack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
