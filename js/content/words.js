// Word bank. 'word|emoji', 'word' (no picture), or 'word=seg|emoji' with explicit grapheme
// segmentation (tokens joined by '.', each 'text' or 'text:soundId', '_' = silent).
// Every word is one a 5-year-old already knows by ear. A picture is only given when the emoji
// unambiguously shows that exact word (each emoji is used by one word only).
export const WORDS = [
  // ---- Stage 1: a m s t f d i ----
  'cold=c.o:oe.l.d|🥶', 'gold=g.o:oe.l.d', 'told=t.o:oe.l.d', 'hold=h.o:oe.l.d', 'am', 'at', 'mat', 'sat', 'fat', 'mast', 'dad', 'mad|😠', 'sad|😢', 'add|➕', 'dam',
  'it', 'if', 'sit', 'fit', 'did', 'miss', 'mitt',
  // n o p g
  'man|👨', 'fan|🪭', 'tin', 'fin', 'in', 'an',
  'on', 'not', 'dot', 'nod', 'off', 'toss', 'moss', 'mom', 'odd',
  'pan|🍳', 'pin|📌', 'map|🗺️', 'nap', 'sip', 'tip', 'top', 'pop', 'pot', 'mop', 'dip', 'pit', 'pat', 'pad',
  'pig|🐷', 'dog|🐶', 'fog|🌫️', 'dig|⛏️', 'gas|⛽', 'tag|🏷️', 'got', 'gap',
  // c k h u
  'cat|🐱', 'cap|🧢', 'can|🥫', 'kid|🧒', 'kiss|💋', 'cop|👮', 'kit',
  'hat|👒', 'hot|🥵', 'hit', 'him', 'hid', 'hip', 'hop', 'ham', 'hog', 'had', 'hiss',
  'up|⬆️', 'cup|🥤', 'sun|☀️', 'nut|🥜', 'hut|🛖', 'hug|🤗', 'mug|☕', 'cut|✂️', 'fun', 'hum', 'tug', 'dug', 'mud', 'gum', 'pup', 'us', 'puff', 'fuss',
  // b l r e
  'bat|🦇', 'bag|👜', 'bus|🚌', 'cab|🚕', 'bug|🐛', 'bin|🗑️', 'big', 'bib', 'bit', 'bad', 'but', 'bun', 'tub', 'cub', 'boss',
  'log|🪵', 'pill|💊', 'lip', 'lid', 'lot', 'lap', 'lit', 'hill', 'doll', 'fill', 'gull', 'pal',
  'rat|🐀', 'ram|🐏', 'run|🏃', 'rod|🎣', 'rag', 'ran', 'rip', 'rib', 'rid', 'rot', 'rob', 'rub', 'rug',
  'bed|🛏️', 'hen|🐔', 'pen|🖊️', 'ten|🔟', 'net|🥅', 'red|🟥', 'leg|🦵', 'egg|🥚', 'bell|🔔',
  'pet', 'men', 'get', 'met', 'set', 'beg', 'den', 'fell', 'sell', 'tell', 'less', 'mess', 'fed', 'let',
  // w j v y z x qu
  'web|🕸️', 'wet|💦', 'wig', 'win', 'wag', 'well', 'will',
  'jet', 'jam', 'jog', 'jug', 'job', 'jig',
  'van|🚐', 'vet', 'rev',
  'yes|✅', 'yum|😋', 'yak|🐃', 'yam|🍠', 'zap|⚡', 'jazz|🎷', 'zip', 'fizz', 'buzz', 'yell', 'yet', 'yip',
  'box|📦', 'fox|🦊', 'six|6️⃣', 'ox|🐂', 'ax|🪓', 'fix|🔧', 'mix', 'wax', 'quiz', 'quit',

  // ---- Stage 2: ck sh ch th wh ----
  'duck|🦆', 'sock|🧦', 'rock|🪨', 'lock|🔒', 'sick|🤒', 'luck|🍀', 'lick|👅', 'yuck|🤢', 'puck|🏒',
  'kick', 'neck', 'back', 'pack', 'tick', 'pick', 'deck', 'quack', 'peck', 'tuck', 'dock', 'sack', 'quick',
  'ship|🚢', 'shop|🏪', 'fish|🐟', 'shell|🐚', 'cash|💵', 'hush|🤫', 'dish', 'shed', 'shut', 'rush', 'shock', 'wish',
  'chick|🐤', 'chess|♟️', 'rich|🤑', 'chat|💬', 'chip', 'chin', 'chop', 'much', 'such', 'chug', 'check', 'chill',
  'bath|🛁', 'math', 'moth', 'path', 'thin', 'thick', 'with', 'this', 'that', 'then', 'them', 'than',
  'when', 'whip', 'which', 'whack', 'wham', 'whiz',
  // ng nk
  'ring|💍', 'king|🤴', 'wing|🪽', 'sing|🎤', 'bank|🏦', 'wink|😉', 'think|🤔', 'bang|💥',
  'pink', 'sink', 'song', 'long', 'hang', 'sang', 'rang', 'lung', 'fang', 'thing', 'thank', 'ink', 'sank', 'yank', 'dunk', 'bunk', 'junk', 'honk',
  // starting blends
  'frog|🐸', 'flag|🚩', 'crab|🦀', 'drum|🥁', 'sled|🛷', 'clap|👏', 'stop|🛑', 'brick|🧱', 'truck|🚚', 'clock|🕐',
  'dress|👗', 'skull|💀', 'plug|🔌', 'grin|😁', 'swim|🏊', 'brush|🪥', 'drip|💧', 'clip|📎', 'squid|🦑', 'string|🧵',
  'trash', 'splash', 'spot', 'skip', 'trip', 'snap', 'slip', 'step', 'spin', 'drop', 'grab', 'glad', 'sniff', 'smell', 'spell',
  'still', 'spill', 'snack', 'black', 'track', 'trick', 'stuck', 'block', 'flash', 'scrub', 'swing', 'sting', 'bring', 'crash',
  'smash', 'crack', 'press', 'flat', 'slam', 'twig', 'twin', 'crib', 'flip', 'glass', 'grass', 'fresh', 'slug', 'plum', 'club',
  'drag', 'stem', 'slid', 'swam', 'stick', 'flop', 'cliff', 'trap', 'spit', 'skid', 'spun', 'plan', 'splish', 'tracks', 'stops', 'drops',
  // ending blends and plurals
  'hand|✋', 'nest|🪺', 'milk|🥛', 'tent|⛺', 'gift|🎁', 'mask|🎭', 'ant|🐜', 'plant|🪴', 'fist|✊', 'elf|🧝', 'golf|⛳',
  'vest|🦺', 'punch|👊', 'skunk|🦨', 'shrimp|🦐',
  'desk', 'belt', 'lamp', 'jump', 'pond', 'wind', 'hunt', 'list', 'lift', 'raft', 'help', 'melt', 'band', 'stamp', 'camp',
  'just', 'must', 'best', 'next', 'fast', 'last', 'lost', 'went', 'and', 'bump', 'dump', 'pump', 'ask', 'held', 'trunk',
  'chest', 'west', 'bench', 'lunch', 'munch', 'pinch', 'inch', 'gulp', 'ramp', 'stomp', 'shelf', 'sand', 'drink', 'end', 'its',
  'kids', 'socks', 'cats|🐱🐱', 'dogs|🐶🐶', 'pigs|🐷🐷', 'hens', 'bugs', 'beds', 'eggs', 'rings', 'ducks|🦆🦆', 'ships', 'frogs', 'hats', 'cups',
  'legs', 'ants', 'pants', 'blocks', 'jumps', 'runs', 'pals',

  // ---- Stage 3: magic e ----
  'cake|🎂', 'snake|🐍', 'game|🎮', 'grape|🍇', 'plane|✈️', 'skate|⛸️', 'wave|👋', 'whale|🐋', 'flame|🔥', 'crane|🏗️',
  'frame|🖼️', 'plate|🍽️', 'vase|🏺',
  'lake', 'gate', 'cave', 'tape', 'rake', 'bake', 'name', 'made', 'shake', 'cape', 'same', 'late', 'safe', 'save', 'gave',
  'came', 'take', 'make', 'ate', 'makes=m.a:ae.k.e:_.s', 'snakes=s.n.a:ae.k.e:_.s', 'grapes=g.r.a:ae.p.e:_.s',
  'bike|🚲', 'kite|🪁', 'five|5️⃣', 'dive|🤿', 'slide|🛝', 'smile|😊', 'nine|9️⃣', 'pine|🌲', 'white|⚪', 'prize|🏆', 'bride|👰',
  'hive', 'vine', 'time', 'line', 'bite', 'ride', 'hide', 'wipe', 'like', 'side', 'fine', 'mine', 'pipe', 'drive', 'wide', 'pile',
  'likes=l.i:ie.k.e:_.s', 'rides=r.i:ie.d.e:_.s:z', 'kites=k.i:ie.t.e:_.s', 'bikes=b.i:ie.k.e:_.s',
  'bone|🦴', 'rope|🪢', 'nose=n.o:oe.s:z.e:_|👃', 'rose=r.o:oe.s:z.e:_|🌹', 'globe|🌍', 'hole|🕳️', 'mule|🫏',
  'home', 'cone', 'stone', 'smoke', 'joke', 'note', 'pole', 'stove', 'robe', 'hose=h.o:oe.s:z.e:_', 'those=th:dh.o:oe.s:z.e:_',
  'hope', 'woke', 'broke', 'spoke', 'froze', 'bones=b.o:oe.n.e:_.s:z',
  'cube', 'tube=t.u:oo.b.e:_', 'rule', 'cute', 'tune=t.u:oo.n.e:_', 'flute',
  'go', 'no', 'so', 'hi',
  // open e
  'he', 'me', 'we', 'she', 'be', 'these=th:dh.e:ee.s:z.e:_',

  // ---- vowel teams ----
  'bee|🐝', 'tree|🌳', 'sheep|🐑', 'jeep|🚙', 'queen|👸', 'green|🟩', 'three|3️⃣', 'leaf|🍃', 'sea|🌊', 'meat|🍖',
  'beach|🏖️', 'peach|🍑', 'tea|🍵', 'beans|🫘', 'seal|🦭', 'jeans|👖', 'cheese=ch.ee.s:z.e:_|🧀', 'wheel|🛞', 'sleep|😴',
  'feet', 'teeth', 'seed', 'eat', 'read', 'dream', 'team', 'beak', 'sweet', 'street', 'weed', 'peel', 'see', 'week', 'deep',
  'heel', 'need', 'feed', 'keep', 'beep', 'meet', 'seat', 'heat', 'neat', 'clean', 'speak', 'sneak', 'sheet', 'each', 'seen',
  'rain|🌧️', 'train|🚆', 'snail|🐌', 'mail|📬', 'nail|💅', 'sail|⛵', 'chain|⛓️', 'brain|🧠', 'paint|🎨',
  'tail', 'day', 'play', 'hay', 'tray', 'pay', 'say', 'gray', 'spray', 'clay', 'stay', 'way', 'may', 'wait', 'rains',
  'goat|🐐', 'coat|🧥', 'soap|🧼', 'road|🛣️', 'snow|❄️', 'bowl|🥣', 'bow|🎀', 'row|🚣', 'boat|🚤',
  'toad', 'toast', 'crow', 'blow', 'grow', 'slow', 'throw', 'float', 'coach', 'foam', 'loaf', 'show', 'low', 'glow', 'oak',
  'light|💡', 'night|🌃', 'fly|🪰', 'spy|🕵️', 'cry', 'high', 'right', 'fight', 'bright', 'sigh', 'tight',
  'my', 'sky', 'dry', 'fry', 'shy', 'try', 'why', 'by',
  'moon|🌙', 'spoon|🥄', 'boot|👢', 'tooth|🦷', 'broom|🧹', 'cool|😎', 'blue|🔵', 'stew|🍲', 'goose=g.oo.s.e:_|🪿', 'boo|👻',
  'zoo', 'food', 'pool', 'roof', 'room', 'new', 'chew', 'glue', 'clue', 'true', 'drool', 'scoop', 'hoop', 'moo', 'noon',
  'too', 'soon', 'grew', 'flew', 'drew', 'hoot', 'boom', 'toot',
  'book|📖', 'cook|🧑‍🍳', 'hook|🪝', 'foot|🦶', 'look|👀', 'good|👍', 'wool|🧶', 'wood', 'hood', 'took', 'stood', 'shook', 'books', 'looks',
  'cow|🐮', 'owl|🦉', 'crown|👑', 'clown|🤡', 'down|⬇️', 'house=h.ou.s.e:_|🏠', 'mouse=m.ou.s.e:_|🐭', 'cloud|☁️', 'mouth|👄', 'couch|🛋️',
  'town', 'how', 'now', 'wow', 'brown', 'out', 'shout', 'loud', 'round', 'sound', 'ground', 'pouch', 'found', 'count', 'south',
  'coin|🪙', 'oil|🛢️', 'point|👉', 'boy|👦', 'toy|🧸', 'boil', 'soil', 'joy', 'noise=n.oi.s:z.e:_', 'foil', 'join', 'spoil', 'oink', 'toys',

  // ---- bossy r, aw/au/all ----
  'car|🚗', 'star|⭐', 'jar|🫙', 'shark|🦈', 'arm|💪', 'card|🃏', 'cart|🛒', 'scarf|🧣', 'farm|🚜',
  'barn', 'park', 'yard', 'dark', 'harp', 'art', 'part', 'start', 'smart', 'hard', 'far', 'bark', 'spark', 'sharp', 'cars=c.ar.s:z',
  'corn|🌽', 'fork|🍴', 'horn|📯', 'storm|⛈️', 'horse=h.or.s.e:_|🐴', 'torch|🔦', 'shorts|🩳',
  'sort', 'fort', 'sport', 'north', 'born', 'for', 'more=m.or.e:_', 'snore=s.n.or.e:_', 'store=s.t.or.e:_', 'short', 'or',
  'bird|🐦', 'girl|👧', 'shirt|👕', 'first|🥇', 'hurt|🤕', 'purse=p.ur.s.e:_|👛', 'surf|🏄', 'church|⛪',
  'her', 'skirt', 'dirt', 'fur', 'burn', 'turn', 'nurse=n.ur.s.e:_', 'curl', 'stir', 'burp', 'chirp',
  'saw|🪚', 'paw|🐾', 'yawn|🥱', 'ball|⚽', 'fall|🍂', 'call|📞',
  'wall', 'claw', 'straw', 'draw', 'jaw', 'crawl', 'hawk', 'lawn', 'tall', 'hall', 'small', 'raw', 'all', 'paws',

  // ---- Stage 4: soft c/g, tch ----
  'ice|🧊', 'rice|🍚', 'gem=g:j.e.m|💎', 'witch|🧙', 'hatch|🐣', 'page|📄', 'race|🏁', 'dice|🎲',
  'face', 'mice', 'space', 'cage', 'huge', 'stage', 'catch', 'match', 'itch', 'patch', 'pitch', 'fetch', 'ditch',
  'sketch', 'scratch', 'switch', 'nice', 'twice',

  // ---- big words ----
  'apple|🍎', 'turtle|🐢', 'candle|🕯️', 'bottle|🍼', 'bubble|🫧', 'purple|🟣', 'pickle|🥒', 'eagle|🦅', 'circle|⭕',
  'beetle|🪲', 'puzzle|🧩', 'noodle|🍜', 'needle|🪡', 'waffle=w.a:o.ff.le|🧇', 'poodle|🐩',
  'table=t.a:ae.b.le', 'little', 'puddle', 'giggle', 'tickle', 'jungle=j.u.n:ng.g.le', 'handle', 'paddle', 'nibble',
  'uncle=u.n:ng.c.le', 'puddles=p.u.dd.le.s:z', 'apples=a.pp.le.s:z',
  'rabbit|🐰', 'sunset|🌅', 'picnic|🧺', 'pumpkin|🎃', 'hotdog|🌭', 'rocket|🚀', 'bucket|🪣', 'button|🔘', 'dragon|🐉',
  'lemon|🍋', 'melon|🍈', 'camel|🐫', 'seven|7️⃣', 'monster|👹', 'lobster|🦞', 'hamster|🐹', 'magnet|🧲', 'ladder|🪜',
  'hammer|🔨', 'butter|🧈', 'letter|✉️', 'flower|🌸', 'shower|🚿', 'farmer|🧑‍🌾', 'mitten|🧤', 'helmet|⛑️', 'trumpet|🎺',
  'pencil|✏️', 'cactus|🌵', 'tennis=t.e.nn.i.s|🎾', 'candy|🍬', 'octopus|🐙', 'kangaroo|🦘', 'mushroom|🍄', 'panda|🐼', 'banana|🍌',
  'cupcake|🧁', 'pancake|🥞', 'popcorn|🍿', 'sandwich|🥪', 'rainbow|🌈', 'snowman|⛄', 'mailbox|📫', 'window|🪟', 'yellow|💛',
  'robot=r.o:oe.b.o.t|🤖', 'tiger=t.i:ie.g.er|🐯', 'spider=s.p.i:ie.d.er|🕷️', 'pirate=p.i:ie.r.a.t.e:_|🏴‍☠️',
  'baby=b.a:ae.b.y:ee|👶', 'hippo=h.i.pp.o:oe|🦛', 'taco=t.a:o.c.o:oe|🌮', 'bacon=b.a:ae.c.o.n|🥓',
  'cherry=ch.e.rr.y:ee|🍒', 'giraffe=g:j.i.r.a.ff.e:_|🦒', 'magic=m.a.g:j.i.c|🪄', 'lion=l.i:ie.o.n|🦁',
  'unicorn=u:yoo.n.i.c.or.n|🦄', 'volcano=v.o.l.c.a:ae.n.o:oe|🌋',
  'pony=p.o:oe.n.y:ee', 'music=m.u:yoo.s:z.i.c', 'paper=p.a:ae.p.er', 'hello=h.e.ll.o:oe', 'over=o:oe.v.er',
  'slowly=s.l.ow:oe.l.y:ee',
  'kitten', 'muffin', 'happy', 'puppy', 'basket', 'dentist', 'napkin', 'pocket', 'jacket', 'kitchen', 'chicken', 'bathtub',
  'pillow', 'insect', 'wagon', 'winter', 'summer', 'dinner', 'sister', 'finger', 'river', 'number', 'tower', 'blanket',
  'jelly', 'bunny', 'funny', 'silly', 'kitty', 'zigzag', 'upset', 'sunny', 'windy', 'muddy', 'teddy', 'daddy', 'mommy',
  'belly', 'under', 'garden', 'hiccups', 'forever', 'reader', 'sandwiches', 'picnics',
  // -ing
  'jumping', 'running', 'sitting', 'swimming', 'singing', 'eating', 'sleeping', 'playing', 'reading', 'fishing', 'digging',
  'hopping', 'kicking', 'looking=l.oo:uu.k.i.ng', 'cooking=c.oo:uu.k.i.ng', 'drinking', 'painting', 'dancing', 'barking',
  'crying=c.r.y:ie.i.ng', 'flying=f.l.y:ie.i.ng', 'going=g.o:oe.i.ng', 'riding=r.i:ie.d.i.ng', 'baking=b.a:ae.k.i.ng',
  'smiling=s.m.i:ie.l.i.ng', 'snowing=s.n.ow:oe.i.ng',
  // -ed
  'jumped=j.u.m.p.ed:t', 'hopped=h.o.pp.ed:t', 'kicked=k.i.ck.ed:t', 'licked=l.i.ck.ed:t', 'picked=p.i.ck.ed:t',
  'packed=p.a.ck.ed:t', 'fixed=f.i.x.ed:t', 'mixed=m.i.x.ed:t', 'kissed=k.i.ss.ed:t', 'missed=m.i.ss.ed:t',
  'fished=f.i.sh.ed:t', 'wished=w.i.sh.ed:t', 'splashed=s.p.l.a.sh.ed:t', 'crashed=c.r.a.sh.ed:t', 'helped=h.e.l.p.ed:t',
  'looked=l.oo:uu.k.ed:t', 'cooked=c.oo:uu.k.ed:t', 'dropped=d.r.o.pp.ed:t', 'stopped=s.t.o.pp.ed:t', 'clapped=c.l.a.pp.ed:t',
  'slipped=s.l.i.pp.ed:t', 'tripped=t.r.i.pp.ed:t', 'zipped=z.i.pp.ed:t', 'camped=c.a.m.p.ed:t', 'sniffed=s.n.i.ff.ed:t',
  'baked=b.a:ae.k.ed:t', 'liked=l.i:ie.k.ed:t', 'asked=a.s.k.ed:t', 'barked=b.ar.k.ed:t', 'hiked=h.i:ie.k.ed:t',
  'hugged=h.u.gg.ed:d', 'begged=b.e.gg.ed:d', 'grabbed=g.r.a.bb.ed:d', 'rubbed=r.u.bb.ed:d', 'hummed=h.u.mm.ed:d',
  'filled=f.i.ll.ed:d', 'spilled=s.p.i.ll.ed:d', 'yelled=y.e.ll.ed:d', 'smelled=s.m.e.ll.ed:d', 'played=p.l.ay.ed:d',
  'stayed=s.t.ay.ed:d', 'cleaned=c.l.ea.n.ed:d', 'dreamed=d.r.ea.m.ed:d', 'rained=r.ai.n.ed:d', 'sailed=s.ai.l.ed:d',
  'called=c.a:o.ll.ed:d', 'crawled=c.r.aw.l.ed:d', 'yawned=y.aw.n.ed:d', 'turned=t.ur.n.ed:d', 'jogged=j.o.gg.ed:d',
  'tugged=t.u.gg.ed:d', 'snowed=s.n.ow:oe.ed:d', 'peeled=p.ee.l.ed:d', 'zoomed=z.oo.m.ed:d', 'smiled=s.m.i:ie.l.ed:d',
  'waved=w.a:ae.v.ed:d', 'named=n.a:ae.m.ed:d', 'rolled=r.o:oe.ll.ed:d', 'cheered=ch.ee.r.ed:d', 'wiggled=w.i.gg.l.ed:d',
];
