const names = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Skyler', 'Avery', 'Peyton', 'Quinn',
  'Jamie', 'Dakota', 'Reese', 'Rowan', 'Sawyer', 'Emerson', 'Finley', 'Harper', 'Jesse', 'Kendall',
  'Logan', 'Parker', 'Sage', 'Tatum', 'Blake', 'Cameron', 'Drew', 'Elliot', 'Hayden', 'Jules',
  'Kai', 'Lane', 'Micah', 'Noel', 'Oakley', 'Payton', 'Reagan', 'Shiloh', 'Teagan', 'Wren'
];

function getRandomName() {
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomDigits(n = 2) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
}

function getRandomDisplayName() {
  const first = getRandomName();
  let second = getRandomName();
  while (second === first) second = getRandomName();
  return `${first} ${second}${getRandomDigits(2)}`;
}

function getRandomUserName() {
  let first = getRandomName();
  let second = getRandomName();
  while (second === first) second = getRandomName();
  return `${first}_${second}${getRandomDigits(2)}`;
}

module.exports = {
  getRandomDisplayName,
  getRandomUserName
}; 