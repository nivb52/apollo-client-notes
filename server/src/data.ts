let categories = [
  { id: "1", label: "✈️ Holiday Planning" },
  { id: "2", label: "🛒 Shopping" },
  { id: "3", label: "📝 Saved articles" },
];

let unpublishedCategories = [
  { id: "4", label: "👶 Childcare" },
  { id: "5", label: "💻 Work" },
];

let allNotes = [
  {
    id: "1",
    content:
      "🇮🇹 Italy trip ideas: Santa Maria del Fiore was built on the site of Florence's second cathedral dedicated to Saint Reparata; the first was the Basilica di San Lorenzo di Firenze, the first building of which was consecrated as a church in 393 by St. Ambrose...",
    categoryId: "1",
  },

  {
    id: "2",
    content:
      "🛫 Flight details: flying out of Manchester --> landing in Florence.",
    categoryId: "1",
  },
  {
    id: "3",
    content:
      "😋 🥘 Great places to eat in Florence: 'Osteria Antica Casa Torre', Piazza Di San Pier Maggiore 7, R, 50122 Firenze",
    categoryId: "1",
  },
  {
    id: "4",
    content:
      "🍨 Delicious gelato: 'Gelateria dei Neri', Via dei Neri, 9/11R, 50122 Firenze",
    categoryId: "1",
  },
  {
    id: "5",
    content:
      "🚲 Bike rental places: 'Florent - Bike rental', Via della Mosca, 10r, 50122 Firenze",
    categoryId: "1",
  },
  {
    id: "6",
    content:
      "📅 Train schedules on last day: 13:50 Platform 1, Florence Station --> Train to Rome",
    categoryId: "1",
  },
  { id: "7", content: "Shopping list: 🍋 Lemons", categoryId: "2" },
  { id: "8", content: "Shopping list: 🥑 Avocados", categoryId: "2" },
  { id: "9", content: "Shopping list: 🍞 Bread", categoryId: "2" },
  { id: "20", content: "Shopping list: 🍷 Wine", categoryId: "2" },
  {
    id: "21",
    content: "Shopping list: 🍿 Popcorn for movie night",
    categoryId: "2",
  },
  {
    id: "22",
    content: "Shopping list: 🌮 Taco shells for taco night",
    categoryId: "2",
  },
  {
    id: "10",
    content:
      "🐦 The Sapphire-throated hummingbird: The sapphire-throated hummingbird is part of the order Apodiformes, which includes the hummingbirds, swifts and treeswifts. They are part of the family Trochilidae, also known as the hummingbirds, which are distinguished by their small size, high metabolism and extremely rapid wing-flapping. Although part of the same genus, the sapphire-throated hummingbird is taxonomically-closer related to the blue-headed sapphire (Chrysuronia grayi) than the shining-green hummingbird.[7] Additionally, the sapphire-throated hummingbird acts as an outgroup for some members of the genus Amazilia, such as the white-chested emerald (Amazilia brevirostris) and the plain-bellied emerald (Amazilia leucogaster)...",
    categoryId: "3",
  },
  {
    id: "11",
    content:
      "⚛️ Neutron star: A neutron star is the collapsed core of a massive supergiant star, which had a total mass of between 10 and 25 solar masses, possibly more if the star was especially metal-rich.[1] Except for black holes, and some hypothetical objects (e.g. white holes, quark stars, and strange stars), neutron stars are the smallest and densest currently known class of stellar objects.[2] Neutron stars have a radius on the order of 10 kilometres (6.2 mi) and a mass of about 1.4 solar masses.[3] They result from the supernova explosion of a massive star, combined with gravitational collapse, that compresses the core past white dwarf star density to that of atomic nuclei....",
    categoryId: "3",
  },
];

let unpublishedNotes = [
  {
    id: "12",
    content:
      "🏛️ Leaning Tower of Pisa: is the campanile, or freestanding bell tower, of the cathedral of the Italian city of Pisa, known worldwide for its nearly four-degree lean, the result of an unstable foundation. The tower is situated behind the Pisa Cathedral and is the third-oldest structure in the ...",
    categoryId: "1",
  },
  {
    id: "13",
    content: "🌋 Reminder to take a picture of Mount Vesuvius at night",
    categoryId: "1",
  },
  {
    id: "14",
    content: "🍕 Frozen Pizza",
    categoryId: "2",
  },
];


export { categories, unpublishedCategories, allNotes, unpublishedNotes };