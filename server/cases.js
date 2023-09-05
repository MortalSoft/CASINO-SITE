const cases = {
	'digital_drops': {
		name: "Digital Drops",
		main_item: 0,
		price: 50.00,
		category: 2,
		items: [
			{
				name: "★ Karambit | Fade (Factory New)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlYG0kfbwNoTdn2xZ_Pp9i_vG8ML20QXi80M4ZGzwddLGcFBtMl2FrlPrxeu71MC0vZifzyZn63In5S3agVXp1g0meEXB",
				price: 816.25,
				chance:  0.1
			}, {
				name: "★ Bayonet | Fade (Factory New)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJcAJE7dizq4yCkP_gDLfQhGxUppBwib3Hod6n2ADnqUdkMW30cYKRdwVtMlrV-gK5yLi71JXpu5XBzHd9-n51Ga5qFJk",
				price: 428.75,
				chance:  0.2
			}, {
				name: "★ Butterfly Knife | Forest DDPAT (Factory New)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4iSqPPwI7rFqWdY781lteXA54vwxgKx80RoN2miItLHd1I_ZV7YqVLsxLzmjMW_vJ6bn3VlsiMl4HbeyUCpwUYb-w4Gnoo",
				price: 373.29,
				chance:  0.3
			}, {
				name: "AWP | Oni Taiji (Factory New)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJK7dK4jYG0m_7zO6_ummpD78A_j-2S9tzwiwSx_BY9a2z0LIecegVoZgmCq1Tqwuvn1pS6vM7PznZq6D5iuyiTFK4_Bw",
				price: 129.15,
				chance:  2.4
			}, {
				name: "AK-47 | Neon Rider (Well-Worn)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJegJM6dO4q5KCk_LmDLfYkWNF18lwmO7Eu9Wn2A3l8kE-Zmj3d4LAIQ82YFzWqFW5xem70MW078jNyXUysycltnfD30vgEgITXkM",
				price: 79.56,
				chance:  12
			}, {
				name: "M4A4 | Asiimov (Well-Worn)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m5a0mvLwOq7cqWdQ-sJ0xOvEpIj0jAbkqEE_ZD3xctLGJAE_Zw7U-QTowefth8TpvM_InHZh6XQ8pSGKWYJAoJI",
				price: 62.93,
				chance:  12
			}, {
				name: "AWP | Oni Taiji (Battle-Scarred)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJK7dK4jYG0n_L1JaLummpD78A_2uuQp433jVftrUdoa2yhJ9WWIFQ8YgmB_FDqwu3mgp68uZzBzHZn7j5iuyiKOTnLvg",
				price: 44.48,
				chance:  12
			}, {
				name: "AK-47 | Neon Rider (Field-Tested)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJegJM6dO4q5KCk_LmDLbUkmJE5fp9i_vG8MKljgDjrkpuZmGiIISRIFU_aQrV81a9kObojMPt6JSYnCRl63Zx5CzZgVXp1oPn8d3r",
				price: 30.87,
				chance:  15.25
			}, {
				name: "AK-47 | Neon Rider (Battle-Scarred)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJK7dK4jYG0m_7zO6_ummpD78A_j-2S9tzwiwSx_BY9a2z0LIecegVoZgmCq1Tqwuvn1pS6vM7PznZq6D5iuyiTFK4_Bw",
				price: 21.43,
				chance:  15.25
			}, {
				name: "Desert Eagle | Mecha Industries (Factory New)",
				quality: "Classified",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PTbTjlH7du6kb-GkvT8MoTdn2xZ_Pp9i_vG8MLw2Ay3-hU4a27zLdCTIAU4aVHV_AK6wL3pjcS9u87IzCQ1vCMn43zYgVXp1jpLSOwz",
				price: 8.45,
				chance:  15.25
			}, {
				name: "Desert Eagle | Mecha Industries (Battle-Scarred)",
				quality: "Classified",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PTbTjlH7du6kb-GkvT8MoTZk2pH8fp9i_vG8MKi2lHir0Zoa2_3J9DEclJvaFjZ_VTolOfrh5G66JXAyXtg7HYg5ynUgVXp1nWpzJUp",
				price: 3.76,
				chance:  15.25
			}
		]
	},

	'hyper_pop': {
		name: "HyperPop",
		main_item: 0,
		price: 7.29,
		category: 2,
		items: [
			{
				name: "★ Navaja Knife | Fade (Factory New)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrQqW1Q7MBOhuDG_Zi72gfkrUpqMG_7cYXBJFI5aFvWrla4k-rr0ZG8tZ6anSFiuilw5SvZmgv330_81mFXSA",
				price: 95.33,
				chance:  3
			}, {
				name: "StatTrak™ Galil AR | Sugar Rush (Minimal Wear)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbupIgthwczLZAJF7dC_mL-IlvnwKrjZl2RC18l4jeHVu9uliwWwqRJqMGuncY-cdFNtZ17Wq1O4wbzphZLvu5vJnHJi6HIg5SvD30vgL7LkLAY",
				price: 51.82,
				chance:  3
			}, {
				name: "AK-47 | Neon Revolution (Minimal Wear)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0924lZKIn-7LP7LWnn8fvsAo0u-R9trzi1bs-hI9NjqiJIXGdwBrNAzW8li4w7jqhcW16cvAzWwj5HdQlBgtMw",
				price: 12.98,
				chance:  5
			}, {
				name: "M4A4 | Cyber Security (Minimal Wear)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09-vloWZh-L6OITdn2xZ_Ispj-2Wpd6s2FCx80toamGld9DBIQZtaVGG-FLskOy-0ZC87snIyiNmpGB8svJNGQN2",
				price: 5.12,
				chance:  5
			}, {
				name: "StatTrak™ P90 | Chopper (Factory New)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopuP1FABz7OORIQJE-dC6q5SDhfjgJ7fUqWdY781lxL6R8Iqj0FDj-0VtZDyhJ4edJwRqN1jVr1G3l-nnhZK4tMzImyM1unQ8pSGK75hLHr0",
				price: 3.2,
				chance:  5
			}, {
				name: "StatTrak™ AWP | Exoskeleton (Field-Tested)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FABz7PLfYQJH9NOln4WHkuP7PYTck29Y_cg_3e-TrYqj2QHn_0JpMDincIGccVc4NAyF-wO_xOnv0MO16c_PmCRm6D5iuyiCZzi-fQ",
				price: 2.15,
				chance:  9
			}, {
				name: "StatTrak™ Music Kit | Amon Tobin, All for Dust",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXO9B9WLbU5oA9OA03dSOq52M3aXWIkdEoFtbzxLV9iiqvJIGwT6t_uwNfewKH2Me3Qzm1U6pYi3L3Ap4_ziQW25QMyNJxFYLB9",
				price: 2.06,
				chance:  10
			}, {
				name: "StatTrak™ M4A4 | Spider Lily (Field-Tested",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhnwMzFJQJE4NOhkZKYqPrxN7LEmyVQ7JMkieiTp92sjAzs_hc4Nm_7LdCcdQdrNVrU_gK6xOnt0MO4tZvP1zI97XHPMlL3",
				price: 1.4,
				chance:  10
			}, {
				name: "StatTrak™ MAC-10 | Malachite (Field-Tested)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0v73fDxBvYyJmYGHlvT8Oq_UqWZU7Mxkh6eRp9-j3FGx_0NpNW70IYaUcQ8_ZQqG_lnolOvu15fqu8jMznQwvHUr-z-DyEjmaY_Y",
				price: 1.30,
				chance:  20
			}, {
				name: "Tec-9 | Toxic (Well-Worn)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoor-mcjhoyszGZD5O6d2kq5OAgvv4IO7ugm5Ssfp8j-3I4IG72g3kr0FoNWz6ctPDIAM5N1GFqVjqkr28h8O0v8nNnHM1v3V05y2LmQv3309H7vIacw",
				price: 1.16,
				chance:  30
			}
		]
	},

	'feeling_lucky': {
		name: "Feeling Lucky",
		main_item: 0,
		price: 0.25,
		category: 2,
		items: [
			{
				name: "M4A4 | The Emperor (Field-Tested)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhnwMzFJTwW09m7hIWZmOXLPr7Vn35cppVy0rCXodyj2QS28kVvYW6ldo-Tew84YA6C-1m7xuzu0ZW56MzLnyB9-n51H0vrrBM",
				price: 10.00,
				chance:  0.15
			}, {
				name: "StatTrak™ AK-47 | Uncharted (Field-Tested)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV092sgIWIqPrxN7LEmyUI6ZAm3ujCpNymjFWx-0RtNjzzctWVIQdqYg7X81nok7rp0JbpuJ7M1zI97ZAMLLaU",
				price: 1.50,
				chance:  0.25
			}, {
				name: "Five-SeveN | Monkey Business (Field-Tested)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTTl2VQ5sROh-zF_Jn4xlbkqURvZmiidYKRdAFoNVzR81bryLvmjZ7o6ZjAmyYw7CNw7SmLzRepwUYbn3RWfTI",
				price: 1.00,
				chance:  1
			}, {
				name: "StatTrak™ P250 | Valence (Minimal Wear)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhhwszYI2gS09-5mpSEguXLP7LWnn8f7sR33-uSpdn23gyw8xY9YWr7JYKUdAVsYQnW8wXvl7_ohpe07pXIwWwj5HeF0_VeIQ",
				price: 0.5,
				chance:  28.6
			}, {
				name: "AUG | Condemned (Battle-Scarred)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot6-iFBRw7P7NYjV96tOkkZOfqPH9Ib7unm5Q_tw_3bqZooqmjQy3qRE5N2n2ddTBIFM_ZVHQ-le8l-3qjcS47ZnKnSBm7j5iuyiaGh1KLQ",
				price: 0.05,
				chance:  30
			}, {
				name: "P250 | Forest Night (Battle-Scarred)",
				quality: "Covert",
				image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhoyszOfi9H_8iJmomMn-PLO77QgHIfvMMki7zC8Y3wjQzg8kZrMm6iJYPBdVU8NwnW_Fi8yOzvhJe7vczAwWwj5Heg6HSDiQ",
				price: 0.01,
				chance:  40
			}
		]
	}
}

module.exports = cases;