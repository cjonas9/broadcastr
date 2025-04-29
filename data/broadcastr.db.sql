BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Artist" (
	"ArtistID"	INTEGER NOT NULL UNIQUE,
	"ArtistName"	TEXT NOT NULL UNIQUE,
	"LastFmMbid"	TEXT,
	PRIMARY KEY("ArtistID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Period" (
	"PeriodID"	INTEGER NOT NULL UNIQUE,
	"PeriodName"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("PeriodID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "TopArtist" (
	"TopArtistID"	INTEGER NOT NULL UNIQUE,
	"UserID"	INTEGER NOT NULL,
	"ArtistID"	INTEGER NOT NULL,
	"PeriodID"	INTEGER NOT NULL,
	"Playcount"	INTEGER NOT NULL,
	"LastUpdated"	TEXT NOT NULL,
	PRIMARY KEY("TopArtistID" AUTOINCREMENT),
	FOREIGN KEY("ArtistID") REFERENCES "Artist"("ArtistID"),
	FOREIGN KEY("PeriodID") REFERENCES "Period"("PeriodID"),
	FOREIGN KEY("UserID") REFERENCES "User"("UserID")
);
CREATE TABLE IF NOT EXISTS "User" (
	"UserID"	INTEGER NOT NULL UNIQUE,
	"BroadCastrProfileName"	TEXT NOT NULL UNIQUE,
	"LastFmProfileName"	TEXT,
	"FirstName"	TEXT,
	"LastName"	TEXT,
	"EmailAddress"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("UserID" AUTOINCREMENT)
);
INSERT INTO "Artist" VALUES (1,'Weezer','6fe07aa5-fec0-4eca-a456-f29bff451b04');
INSERT INTO "Artist" VALUES (2,'twenty one pilots','a6c6897a-7415-4f8d-b5a5-3a5e05f3be67');
INSERT INTO "Artist" VALUES (3,'The Killers','95e1ead9-4d31-4808-a7ac-32c3614c116b');
INSERT INTO "Artist" VALUES (4,'Arcade Fire','52074ba6-e495-4ef3-9bb4-0703888a9f68');
INSERT INTO "Artist" VALUES (5,'Starfucker','');
INSERT INTO "Artist" VALUES (6,'Slothrust','86c80cc3-13b0-4ca7-ae5a-d16f00c11a59');
INSERT INTO "Artist" VALUES (7,'The Big Moon','9bb06c9f-31d7-4809-9e95-2e647a23a735');
INSERT INTO "Artist" VALUES (8,'Passenger','');
INSERT INTO "Artist" VALUES (9,'Metric','4449ccf6-c948-4d33-aa97-b6ad98ce4b5b');
INSERT INTO "Artist" VALUES (10,'Belle and Sebastian','e5c7b94f-e264-473c-bb0f-37c85d4d5c70');
INSERT INTO "Artist" VALUES (11,'The Head and the Heart','98cb416e-5271-484c-ab3b-6bed6b4aae12');
INSERT INTO "Artist" VALUES (12,'Pink Floyd','83d91898-7763-47d7-b03b-b92132375c47');
INSERT INTO "Artist" VALUES (13,'Haerts','a1e94252-6129-4747-ac5e-d9ffc5fd725e');
INSERT INTO "Artist" VALUES (14,'Broken Bells','');
INSERT INTO "Artist" VALUES (15,'Alan Walker','b0e4bc50-3062-4d31-afad-def6a6b7a8e9');
INSERT INTO "Artist" VALUES (16,'Foster the People','e0e1a584-dd0a-4bd1-88d1-c4c62895039d');
INSERT INTO "Artist" VALUES (17,'Declan McKenna','8b98035f-fbd2-4fb3-9c2f-263c7506680d');
INSERT INTO "Artist" VALUES (18,'Haunted Mansions','');
INSERT INTO "Artist" VALUES (19,'Electric Guest','01202233-d155-4cfa-83bf-55dc776bc309');
INSERT INTO "Artist" VALUES (20,'Portugal. The Man','3599a39e-4e10-4cb5-90d4-c8a015ebc73b');
INSERT INTO "Period" VALUES (1,'7day');
INSERT INTO "Period" VALUES (2,'1month');
INSERT INTO "Period" VALUES (3,'12month');
INSERT INTO "Period" VALUES (4,'overall');
INSERT INTO "TopArtist" VALUES (81,2,1,4,2422,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (82,2,2,4,1943,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (83,2,3,4,1299,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (84,2,4,4,1024,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (85,2,5,4,726,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (86,2,6,4,700,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (87,2,7,4,666,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (88,2,8,4,642,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (89,2,9,4,585,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (90,2,10,4,537,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (91,2,11,4,525,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (92,2,12,4,495,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (93,2,13,4,412,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (94,2,14,4,409,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (95,2,15,4,397,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (96,2,16,4,377,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (97,2,17,4,367,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (98,2,18,4,360,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (99,2,19,4,350,'2025-04-29 00:54:55');
INSERT INTO "TopArtist" VALUES (100,2,20,4,348,'2025-04-29 00:54:55');
INSERT INTO "User" VALUES (1,'cjonas41','cjonas41','Christian','Jonas','cajon@stanford.edu');
INSERT INTO "User" VALUES (2,'lmscott17','lmscott17','Lucas','Scott','lmscott@stanford.edu');
INSERT INTO "User" VALUES (3,'madifan','','Madison','Fan','madifan@stanford.edu');
INSERT INTO "User" VALUES (4,'asher104','','Asher','Hensley','asher104@stanford.edu');
COMMIT;
