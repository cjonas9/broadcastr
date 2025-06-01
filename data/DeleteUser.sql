DROP TABLE IF EXISTS temp_vars;

CREATE TEMP TABLE temp_vars (my_var INTEGER);
INSERT INTO temp_vars VALUES (36); /* Put the user ID to delete here */

DELETE FROM TopTrack
WHERE UserID = (SELECT my_var FROM temp_vars);

DELETE FROM TopAlbum
WHERE UserID = (SELECT my_var FROM temp_vars);

DELETE FROM TopArtist
WHERE UserID = (SELECT my_var FROM temp_vars);

DELETE FROM User
WHERE UserID = (SELECT my_var FROM temp_vars);


DROP TABLE IF EXISTS temp_vars;