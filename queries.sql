DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id serial NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(32) NOT NULL,
    bio VARCHAR(300),
    creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE posts (
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(100) NOT NULL,
	rating DECIMAL NOT NULL,
	review TEXT NOT NULL,
	author INT NOT NULL,
    image VARCHAR(200) NOT NULL DEFAULT 'images/placeholder.png',
	creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    image_loaded BOOLEAN NOT NULL DEFAULT false,
    name_changed BOOLEAN NOT NULL DEFAULT true,
	FOREIGN KEY (author) REFERENCES users(id)
);

INSERT INTO users (name, username, email, password, bio, creation_date)
VALUES
	('Victor Nabasu', 'victornabasu', 'victornabasu@yahoo.com', 'password', 'I don''t really have anything to say', '2021-01-01'),
	('Nero Siegfried', 'NeroSiegfried', 'nerosiegfried@gmail.com', 'password', 'I don''t really have anything to say either', '2023-06-01');

INSERT INTO posts (name, rating, review, author, creation_date)
VALUES
	('Shawshank Redemption', 10, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 1, '2021-01-01'),
	('The Godfather', 8, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 1, '2021-01-03'),
	('The Dark Knight', 10, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 1, '2021-01-12'),
	('The Lord of The Rings: Return of the King', 10, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 2, '2023-06-03');
