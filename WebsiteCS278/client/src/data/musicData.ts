type Artist = {
  id: number;
  name: string;
  scrobbles: number;
  imageUrl: string;
};

type Friend = {
  id: number;
  username: string;
  swag: number;
  profileImage: string;
  topArtists: Artist[];
};

export const musicData = {
  user: {
    username: "@daniel123",
    swag: 240,
    profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=200&h=200",
  },
  topArtists: [
    {
      id: 1,
      name: "Beyonce",
      scrobbles: 1240,
      imageUrl: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBhcnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 2,
      name: "Laufey",
      scrobbles: 987,
      imageUrl: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljJTIwYXJ0aXN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 3,
      name: "Fred Again",
      scrobbles: 856,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWMlMjBhcnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 4,
      name: "JORDY",
      scrobbles: 745,
      imageUrl: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWMlMjBhcnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 5,
      name: "Mitski",
      scrobbles: 698,
      imageUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100"
    }
  ],
  topListeners: [
    {
      id: 1,
      username: "@musiclover42",
      scrobbles: 2105,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 2,
      username: "@beatmaster",
      scrobbles: 1876,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 3,
      username: "@rhythmguru",
      scrobbles: 1654,
      profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 4,
      username: "@melodyqueen",
      scrobbles: 1432,
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      id: 5,
      username: "@basshead",
      scrobbles: 1289,
      profileImage: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHVzZXIlMjBwcm9maWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&h=100"
    },
	{
		id: 9,
		username: "@daniel123",
		scrobbles: 1240,
		profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=200&h=200"
	}
  ],
  friends: [
    {
      id: 101,
      username: "@musiclover42",
      swag: 220,
      scrobbles: 2105,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100",
      topArtists: [
        {
          id: 201,
          name: "Doja Cat",
          scrobbles: 300,
          imageUrl: "https://ca-times.brightspotcdn.com/dims4/default/e9e83cc/2147483647/strip/true/crop/3250x1828+0+12/resize/1200x675!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F5f%2Ffb%2Fbc575c30444f8c1ce5e6f6980194%2F2023-time100-gala-73445.jpg"
        },
        {
          id: 202,
          name: "SZA",
          scrobbles: 450,
          imageUrl: "https://ntvb.tmsimg.com/assets/assets/1027990_v9_bc.jpg"
        }
      ]
    },
    {
      id: 102,
      username: "@beatmaster",
      swag: 180,
      scrobbles: 1876,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100",
      topArtists: [
        {
          id: 201,
          name: "Doja Cat",
          scrobbles: 900,
          imageUrl: "https://ca-times.brightspotcdn.com/dims4/default/e9e83cc/2147483647/strip/true/crop/3250x1828+0+12/resize/1200x675!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F5f%2Ffb%2Fbc575c30444f8c1ce5e6f6980194%2F2023-time100-gala-73445.jpg"
        },
        {
          id: 202,
          name: "SZA",
          scrobbles: 870,
          imageUrl: "https://ntvb.tmsimg.com/assets/assets/1027990_v9_bc.jpg"
        }
      ]
    }
    // etc.
  ],
  mockSongs: [
    {
      id: "1",
      title: "Geyser",
      artist: "Mitski",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c428f67b4a9b7e1114dfc117",
      trackLink: "https://open.spotify.com/track/2fCdOF4nBAeQaXW84WjoiU?si=eabcc63644a242e4"
    },
    {
      id: "2",
      title: "Old Friend",
      artist: "Mitski",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c428f67b4a9b7e1114dfc117",
      trackLink: "https://open.spotify.com/track/6zg1bV9ESNLTmtB0Os3FA4?si=ca608260afa84068"
    },
    {
      id: "3",
      title: "A Pearl",
      artist: "Mitski",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c428f67b4a9b7e1114dfc117",
      trackLink: "https://open.spotify.com/track/7fd3aMiuwHWKsTdZafjOfZ?si=4a4e263cf844435b"
    },
    {
      id: "4",
      title: "Lonesome Love",
      artist: "Mitski",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c428f67b4a9b7e1114dfc117",
      trackLink: "https://open.spotify.com/track/3bjPPTMGBp8e36BYJaXDO2?si=79f7374fda224165"
    },
    {
      id: "5",
      title: "Nobody",
      artist: "Mitski",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c428f67b4a9b7e1114dfc117",
      trackLink: "https://open.spotify.com/track/2P5yIMu2DNeMXTyOANKS6k?si=e682e41e91744ac3"
    }
  ]
};

