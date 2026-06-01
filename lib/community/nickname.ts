const adjectives = ["느긋한", "야무진", "반짝이는", "차분한", "용감한", "꼼꼼한", "명랑한"];
const nouns = ["개미", "주린이", "차트친구", "배당요정", "호가탐험가", "시장산책러"];

export function makeNickname() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(1000 + Math.random() * 9000);

  return `${adjective}${noun}${number}`;
}
