// Az útlevél városainak nevezetességei – valós koordinátákkal (szélesség, hosszúság).
// Minden elfogadott szorgalmi a következő nevezetességhez visz (a felsorolás sorrendje = az útvonal);
// ha mind megvan, jár a városbélyeg. Városonként 5–8 állomás, hogy változatos legyen a kihívás.
// lab: a felirat helye a jelölőhöz képest (r / l / t / b). water: folyó vagy part (sematikus vonal).

export const CITY_SIGHTS = {
  london: {
    water: [{ name: 'River Thames', line: [[51.4847, -0.1500], [51.4877, -0.1270], [51.4945, -0.1236], [51.5008, -0.1219], [51.5065, -0.1220], [51.5087, -0.1170], [51.5100, -0.1040], [51.5095, -0.0985], [51.5079, -0.0877], [51.5055, -0.0754], [51.5040, -0.0650]], at: [51.5062, -0.0960] }],
    sights: [
      { name: 'British Museum', at: [51.5194, -0.1270], lab: 't', fact: 'Entry is free – and it holds the Rosetta Stone.' },
      { name: 'Trafalgar Square', at: [51.5080, -0.1281], lab: 't', fact: 'Nelson’s Column is guarded by four huge bronze lions.' },
      { name: 'Buckingham Palace', at: [51.5014, -0.1419], lab: 'b', fact: 'When the King is at home, the Royal Standard flag flies above the palace.' },
      { name: 'Big Ben', at: [51.5007, -0.1246], lab: 'b', fact: 'Big Ben is the bell – the tower is called the Elizabeth Tower.' },
      { name: 'London Eye', at: [51.5033, -0.1196], lab: 'r', fact: 'The London Eye is 135 metres tall; one turn takes about 30 minutes.' },
      { name: 'St Paul’s Cathedral', at: [51.5138, -0.0984], lab: 't', fact: 'In the Whispering Gallery you can hear a whisper from across the dome.' },
      { name: 'Tower of London', at: [51.5081, -0.0759], lab: 't', fact: 'Ravens live here – legend says the kingdom will fall if they leave.' },
      { name: 'Tower Bridge', at: [51.5055, -0.0754], lab: 'b', fact: 'Its roads lift up to let tall ships pass underneath.' },
    ],
  },
  edinburgh: {
    water: [],
    sights: [
      { name: 'Edinburgh Castle', at: [55.9486, -3.1999], lab: 'b', fact: 'The One O’Clock Gun is fired from the castle every day except Sunday.' },
      { name: 'Royal Mile', at: [55.9495, -3.1908], lab: 'r', fact: 'It is about a Scots mile long – a bit longer than an English mile.' },
      { name: 'Scott Monument', at: [55.9524, -3.1933], lab: 't', fact: 'One of the largest monuments to a writer anywhere in the world.' },
      { name: 'Calton Hill', at: [55.9555, -3.1826], lab: 't', fact: 'Its unfinished National Monument was meant to copy the Parthenon in Athens.' },
      { name: 'Holyroodhouse', at: [55.9527, -3.1722], lab: 'r', fact: 'The Palace of Holyroodhouse is the King’s official home in Scotland.' },
      { name: 'Arthur’s Seat', at: [55.9441, -3.1618], lab: 'b', fact: 'An ancient volcano right in the city – and you can climb to the top.' },
    ],
  },
  dublin: {
    water: [{ name: 'River Liffey', line: [[53.3460, -6.2950], [53.3463, -6.2800], [53.3456, -6.2700], [53.3465, -6.2630], [53.3473, -6.2560], [53.3478, -6.2450], [53.3470, -6.2330]], at: [53.3482, -6.2790] }],
    sights: [
      { name: 'Guinness Storehouse', at: [53.3419, -6.2867], lab: 'l', fact: 'The brewery’s lease, signed in 1759, was for 9,000 years.' },
      { name: 'St Patrick’s Cathedral', at: [53.3395, -6.2715], lab: 'b', fact: 'Jonathan Swift, author of Gulliver’s Travels, was its dean.' },
      { name: 'Dublin Castle', at: [53.3429, -6.2674], lab: 'b', fact: 'For about 700 years it was the centre of British rule in Ireland.' },
      { name: 'Ha’penny Bridge', at: [53.3464, -6.2630], lab: 't', fact: 'Named after the halfpenny people once paid to cross it.' },
      { name: 'Trinity College', at: [53.3438, -6.2546], lab: 'r', fact: 'Its library holds the Book of Kells, a manuscript over 1,000 years old.' },
      { name: 'GPO, O’Connell Street', at: [53.3498, -6.2603], lab: 't', fact: 'The headquarters of the 1916 Easter Rising.' },
    ],
  },
  cardiff: {
    water: [{ name: 'River Taff', line: [[51.4960, -3.1960], [51.4890, -3.1910], [51.4840, -3.1885], [51.4780, -3.1850], [51.4710, -3.1800], [51.4630, -3.1720]], at: [51.4905, -3.1945] }],
    sights: [
      { name: 'Roath Park Lake', at: [51.5055, -3.1755], lab: 't', fact: 'Its lighthouse-shaped clock tower remembers Captain Scott’s Antarctic voyage.' },
      { name: 'National Museum', at: [51.4858, -3.1771], lab: 'r', fact: 'It has one of Europe’s finest collections of Impressionist paintings.' },
      { name: 'Cardiff Castle', at: [51.4822, -3.1812], lab: 'r', fact: 'Its Norman keep stands on a man-made mound.' },
      { name: 'Principality Stadium', at: [51.4782, -3.1826], lab: 'l', fact: 'The stadium has a roof that can open and close.' },
      { name: 'Wales Millennium Centre', at: [51.4650, -3.1635], lab: 'r', fact: 'Huge words in Welsh and English are written across its front.' },
    ],
  },
  newyork: {
    water: [],
    labels: [{ name: 'Hudson River', at: [40.7350, -74.0200] }, { name: 'East River', at: [40.7300, -73.9640] }],
    sights: [
      { name: 'Statue of Liberty', at: [40.6892, -74.0445], lab: 'r', fact: 'A gift from France – its copper skin turned green over time.' },
      { name: 'One World Trade Center', at: [40.7127, -74.0134], lab: 'l', fact: 'It is 1,776 feet tall – a nod to 1776, the year of independence.' },
      { name: 'Brooklyn Bridge', at: [40.7061, -73.9969], lab: 'r', fact: 'In 1883 it opened as the longest suspension bridge in the world.' },
      { name: 'Empire State Building', at: [40.7484, -73.9857], lab: 'l', fact: 'It was built in just over a year, in 1930–31.' },
      { name: 'Grand Central', at: [40.7527, -73.9772], lab: 'r', fact: 'The main hall’s ceiling is painted with stars and zodiac signs.' },
      { name: 'Times Square', at: [40.7580, -73.9855], lab: 'l', fact: 'On New Year’s Eve a glittering ball drops here at midnight.' },
      { name: 'Central Park', at: [40.7740, -73.9708], lab: 'l', fact: 'Central Park is bigger than the whole country of Monaco.' },
      { name: 'The Met', at: [40.7794, -73.9632], lab: 'r', fact: 'The Metropolitan Museum has well over a million objects.' },
    ],
  },
  toronto: {
    water: [],
    labels: [{ name: 'Lake Ontario', at: [43.6300, -79.4020] }],
    sights: [
      { name: 'Toronto Islands', at: [43.6205, -79.3780], lab: 'b', fact: 'The islands are almost car-free – you get there by ferry.' },
      { name: 'CN Tower', at: [43.6426, -79.3871], lab: 'l', fact: 'It was the world’s tallest free-standing structure for over 30 years.' },
      { name: 'St. Lawrence Market', at: [43.6487, -79.3716], lab: 'r', fact: 'There has been a market here since 1803.' },
      { name: 'Royal Ontario Museum', at: [43.6677, -79.3948], lab: 'r', fact: 'Its crystal-shaped entrance is called the Michael Lee-Chin Crystal.' },
      { name: 'Casa Loma', at: [43.6780, -79.4094], lab: 'l', fact: 'A castle-style house from the early 1900s – with secret passages.' },
    ],
  },
  sydney: {
    water: [],
    labels: [{ name: 'Sydney Harbour', at: [-33.8540, 151.2270] }],
    sights: [
      { name: 'Darling Harbour', at: [-33.8748, 151.2005], lab: 'l', fact: 'Once a busy port and railway yard – now full of museums.' },
      { name: 'The Rocks', at: [-33.8599, 151.2090], lab: 'l', fact: 'The first British colony in Australia was set up here in 1788.' },
      { name: 'Harbour Bridge', at: [-33.8523, 151.2108], lab: 'l', fact: 'You can climb its arch, 134 metres above the water.' },
      { name: 'Luna Park', at: [-33.8476, 151.2099], lab: 't', fact: 'Its giant smiling face has welcomed visitors since 1935.' },
      { name: 'Opera House', at: [-33.8568, 151.2153], lab: 'r', fact: 'It opened in 1973 and is a UNESCO World Heritage Site.' },
      { name: 'Royal Botanic Garden', at: [-33.8642, 151.2166], lab: 'r', fact: 'Opened in 1816 – Australia’s oldest scientific institution.' },
      { name: 'Taronga Zoo', at: [-33.8436, 151.2411], lab: 'l', fact: 'Its animals enjoy one of the best harbour views in the city.' },
    ],
  },
  wellington: {
    water: [],
    labels: [{ name: 'Wellington Harbour', at: [-41.2840, 174.7915] }],
    sights: [
      { name: 'Botanic Garden', at: [-41.2817, 174.7676], lab: 'l', fact: 'From the garden you can ride the red cable car down to the city.' },
      { name: 'Cable Car', at: [-41.2853, 174.7756], lab: 'l', fact: 'It climbs about 120 metres from Lambton Quay to Kelburn.' },
      { name: 'The Beehive', at: [-41.2784, 174.7767], lab: 'r', fact: 'The nickname of the round Parliament building – it really looks like one.' },
      { name: 'Te Papa', at: [-41.2905, 174.7821], lab: 'r', fact: 'The national museum – its name means “container of treasures”.' },
      { name: 'Mount Victoria', at: [-41.2963, 174.7944], lab: 'b', fact: 'Some Lord of the Rings scenes were filmed on its slopes.' },
    ],
  },
  capetown: {
    water: [],
    labels: [{ name: 'Table Bay', at: [-33.8650, 18.4300] }],
    sights: [
      { name: 'Kirstenbosch', at: [-33.9875, 18.4327], lab: 'r', fact: 'Its curvy treetop walkway is nicknamed “the Boomslang” (tree snake).' },
      { name: 'Table Mountain', at: [-33.9628, 18.4098], lab: 'l', fact: 'A rotating cable car takes you up to the flat top.' },
      { name: 'Lion’s Head', at: [-33.9356, 18.3890], lab: 'l', fact: 'A favourite hike to watch the sunrise over the city.' },
      { name: 'Bo-Kaap', at: [-33.9205, 18.4155], lab: 'r', fact: 'Famous for its brightly painted houses.' },
      { name: 'V&A Waterfront', at: [-33.9036, 18.4207], lab: 'r', fact: 'Named after Queen Victoria and her son Alfred.' },
      { name: 'Robben Island', at: [-33.8076, 18.3712], lab: 'r', fact: 'You take the ferry from the Waterfront – Nelson Mandela was imprisoned here for 18 years.' },
    ],
  },
  sanfrancisco: {
    water: [],
    labels: [{ name: 'San Francisco Bay', at: [37.8155, -122.4470] }],
    sights: [
      { name: 'Painted Ladies', at: [37.7762, -122.4328], lab: 'l', fact: 'A row of colourful Victorian houses at Alamo Square.' },
      { name: 'Cable Car Turnaround', at: [37.7848, -122.4078], lab: 'b', fact: 'San Francisco’s cable cars are a moving National Historic Landmark.' },
      { name: 'Chinatown', at: [37.7906, -122.4056], lab: 'r', fact: 'The oldest Chinatown in North America.' },
      { name: 'Lombard Street', at: [37.8021, -122.4187], lab: 'l', fact: 'It has eight hairpin bends in a single block.' },
      { name: 'Pier 39', at: [37.8087, -122.4098], lab: 'r', fact: 'Sea lions sunbathe on its wooden docks.' },
      { name: 'Alcatraz', at: [37.8267, -122.4230], lab: 't', fact: 'Once a famous prison island – now a museum.' },
      { name: 'Golden Gate Bridge', at: [37.8199, -122.4783], lab: 't', fact: 'In 1937 it opened as the longest suspension bridge in the world.' },
    ],
  },
}

export const sightsOf = (place) => CITY_SIGHTS[place?.id]?.sights || []
