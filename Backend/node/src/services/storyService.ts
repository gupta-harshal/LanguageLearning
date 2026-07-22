import { awardProgress, prisma } from './progressService';

export type StorySentence = {
  ja: string;
  reading: string;
  en: string;
};

type StorySeed = {
  slug: string;
  level: number;
  order: number;
  titleJa: string;
  titleEn: string;
  summary: string;
  theme: string;
  sentences: StorySentence[];
};

/** 3 stories × 5 levels — progressive difficulty for sliding-window read-aloud. */
export const STORY_SEEDS: StorySeed[] = [
  // ─── Level 1 · N5 · hiragana-heavy ─────────────────────────────────────
  {
    slug: 'cat-morning',
    level: 1,
    order: 1,
    titleJa: 'ねこのあさ',
    titleEn: "The Cat's Morning",
    summary: 'A small cat wakes up and greets the sun.',
    theme: 'animals',
    sentences: [
      { ja: 'あさです。', reading: 'あさです。', en: 'It is morning.' },
      { ja: 'ねこがおきます。', reading: 'ねこがおきます。', en: 'The cat wakes up.' },
      { ja: 'ねこはみずをのみます。', reading: 'ねこはみずをのみます。', en: 'The cat drinks water.' },
      { ja: 'そとはあかるいです。', reading: 'そとはあかるいです。', en: 'Outside is bright.' },
      { ja: 'ねこはまどをみます。', reading: 'ねこはまどをみます。', en: 'The cat looks at the window.' },
      { ja: 'とりがうたいます。', reading: 'とりがうたいます。', en: 'A bird sings.' },
      { ja: 'ねこはにこにこします。', reading: 'ねこはにこにこします。', en: 'The cat smiles.' },
      { ja: 'きょうもいいひです。', reading: 'きょうもいいひです。', en: 'Today is a good day too.' },
    ],
  },
  {
    slug: 'rice-ball',
    level: 1,
    order: 2,
    titleJa: 'おいしいおにぎり',
    titleEn: 'A Tasty Onigiri',
    summary: 'Making a simple rice ball for lunch.',
    theme: 'food',
    sentences: [
      { ja: 'ごはんがあります。', reading: 'ごはんがあります。', en: 'There is rice.' },
      { ja: 'しおをすこしつけます。', reading: 'しおをすこしつけます。', en: 'I add a little salt.' },
      { ja: 'てでにぎります。', reading: 'てでにぎります。', en: 'I shape it with my hands.' },
      { ja: 'のりをまきます。', reading: 'のりをまきます。', en: 'I wrap it in nori.' },
      { ja: 'おにぎりができました。', reading: 'おにぎりができました。', en: 'The rice ball is done.' },
      { ja: 'たべます。おいしいです。', reading: 'たべます。おいしいです。', en: 'I eat it. It is delicious.' },
      { ja: 'ともだちにもあげます。', reading: 'ともだちにもあげます。', en: 'I also give one to a friend.' },
      { ja: 'みんなうれしいです。', reading: 'みんなうれしいです。', en: 'Everyone is happy.' },
    ],
  },
  {
    slug: 'park-walk',
    level: 1,
    order: 3,
    titleJa: 'こうえんさんぽ',
    titleEn: 'A Walk in the Park',
    summary: 'A short walk under the trees.',
    theme: 'everyday',
    sentences: [
      { ja: 'わたしはこうえんにいきます。', reading: 'わたしはこうえんにいきます。', en: 'I go to the park.' },
      { ja: 'きがおおいです。', reading: 'きがおおいです。', en: 'There are many trees.' },
      { ja: 'いぬがはしります。', reading: 'いぬがはしります。', en: 'A dog runs.' },
      { ja: 'こどもがあそびます。', reading: 'こどもがあそびます。', en: 'Children play.' },
      { ja: 'わたしはすわります。', reading: 'わたしはすわります。', en: 'I sit down.' },
      { ja: 'かぜがきもちいいです。', reading: 'かぜがきもちいいです。', en: 'The wind feels nice.' },
      { ja: 'すこしねむくなります。', reading: 'すこしねむくなります。', en: 'I get a little sleepy.' },
      { ja: 'いえにかえります。', reading: 'いえにかえります。', en: 'I go home.' },
    ],
  },

  // ─── Level 2 · N5+ · particles & daily life ────────────────────────────
  {
    slug: 'train-morning',
    level: 2,
    order: 1,
    titleJa: 'あさのでんしゃ',
    titleEn: 'The Morning Train',
    summary: 'Riding the train to school.',
    theme: 'travel',
    sentences: [
      { ja: 'まいにち、でんしゃにのります。', reading: 'まいにち、でんしゃにのります。', en: 'Every day, I ride the train.' },
      { ja: 'えきはいつもこんんでいます。', reading: 'えきはいつもこんんでいます。', en: 'The station is always crowded.' },
      { ja: 'ドアがひらきます。', reading: 'ドアがひらきます。', en: 'The doors open.' },
      { ja: 'わたしはつりかわをつかみます。', reading: 'わたしはつりかわをつかみます。', en: 'I grab the hand strap.' },
      { ja: 'となりのひとがねています。', reading: 'となりのひとがねています。', en: 'The person next to me is sleeping.' },
      { ja: 'まどからまちが見えます。', reading: 'まどからまちがみえます。', en: 'I can see the town from the window.' },
      { ja: 'つぎはわたしのえきです。', reading: 'つぎはわたしのえきです。', en: 'Next is my station.' },
      { ja: 'いそいでおります。', reading: 'いそいでおります。', en: 'I hurry and get off.' },
      { ja: 'がっこうまであるきます。', reading: 'がっこうまであるきます。', en: 'I walk to school.' },
    ],
  },
  {
    slug: 'convenience-store',
    level: 2,
    order: 2,
    titleJa: 'コンビニのよる',
    titleEn: 'Night at the Convenience Store',
    summary: 'Buying a late snack.',
    theme: 'food',
    sentences: [
      { ja: 'よるの十時です。', reading: 'よるのじゅうじです。', en: 'It is 10 at night.' },
      { ja: 'おなかがすきました。', reading: 'おなかがすきました。', en: 'I am hungry.' },
      { ja: 'コンビニへ行きます。', reading: 'コンビニへいきます。', en: 'I go to the convenience store.' },
      { ja: 'あたたかいおでんがあります。', reading: 'あたたかいおでんがあります。', en: 'There is warm oden.' },
      { ja: 'お茶も買います。', reading: 'おちゃもかいます。', en: 'I also buy tea.' },
      { ja: 'てんいんさんがあいさつします。', reading: 'てんいんさんがあいさつします。', en: 'The clerk greets me.' },
      { ja: '「ありがとうございました。」', reading: '「ありがとうございました。」', en: '"Thank you very much."' },
      { ja: 'いえでゆっくり食べます。', reading: 'いえでゆっくりたべます。', en: 'I eat slowly at home.' },
    ],
  },
  {
    slug: 'rainy-day',
    level: 2,
    order: 3,
    titleJa: 'あめのひ',
    titleEn: 'A Rainy Day',
    summary: 'Staying cozy when it rains.',
    theme: 'weather',
    sentences: [
      { ja: 'きょうはあめがふっています。', reading: 'きょうはあめがふっています。', en: 'It is raining today.' },
      { ja: 'かさを持って出ます。', reading: 'かさをもってでます。', en: 'I go out with an umbrella.' },
      { ja: 'みちがぬれています。', reading: 'みちがぬれています。', en: 'The road is wet.' },
      { ja: 'あしおとが小さくなります。', reading: 'あしおとがちいさくなります。', en: 'Footsteps become quiet.' },
      { ja: 'カフェにはいります。', reading: 'カフェにはいります。', en: 'I enter a café.' },
      { ja: 'ホットコーヒーを飲みます。', reading: 'ホットコーヒーをのみます。', en: 'I drink hot coffee.' },
      { ja: 'まどに雨粒がつきます。', reading: 'まどにあまつぶがつきます。', en: 'Raindrops stick to the window.' },
      { ja: 'あめのひもすきです。', reading: 'あめのひもすきです。', en: 'I like rainy days too.' },
    ],
  },

  // ─── Level 3 · N4 · past tense & emotion ───────────────────────────────
  {
    slug: 'lost-umbrella',
    level: 3,
    order: 1,
    titleJa: 'なくしたかさ',
    titleEn: 'The Lost Umbrella',
    summary: 'Looking for an umbrella after the rain.',
    theme: 'everyday',
    sentences: [
      { ja: 'きのう、かさをなくしました。', reading: 'きのう、かさをなくしました。', en: 'Yesterday, I lost my umbrella.' },
      { ja: 'えきのベンチに置いたままです。', reading: 'えきのベンチにおいたままです。', en: 'I left it on a station bench.' },
      { ja: 'もどってさがしましたが、ありませんでした。', reading: 'もどってさがしましたが、ありませんでした。', en: 'I went back to look, but it was gone.' },
      { ja: 'おみまもりセンターへ行きました。', reading: 'おみまもりセンターへいきました。', en: 'I went to the lost-and-found.' },
      { ja: 'あおいかさがたくさんありました。', reading: 'あおいかさがたくさんありました。', en: 'There were many blue umbrellas.' },
      { ja: 'すこしちがうかさを見ました。', reading: 'すこしちがうかさをみました。', en: 'I saw one that was a little different.' },
      { ja: 'でも、わたしのかさではありませんでした。', reading: 'でも、わたしのかさではありませんでした。', en: 'But it was not my umbrella.' },
      { ja: 'あたらしいかさを買うことにしました。', reading: 'あたらしいかさをかうことにしました。', en: 'I decided to buy a new umbrella.' },
      { ja: 'こんどはなまえを書きます。', reading: 'こんどはなまえをかきます。', en: 'This time I will write my name on it.' },
    ],
  },
  {
    slug: 'first-festival',
    level: 3,
    order: 2,
    titleJa: 'はじめてのまつり',
    titleEn: 'My First Festival',
    summary: 'Summer festival lights and food stalls.',
    theme: 'culture',
    sentences: [
      { ja: 'なつのまつりに行きました。', reading: 'なつのまつりにいきました。', en: 'I went to a summer festival.' },
      { ja: 'ゆかたを着て、わくわくしました。', reading: 'ゆかたをきて、わくわくしました。', en: 'I wore a yukata and felt excited.' },
      { ja: 'やたいのにおいがしました。', reading: 'やたいのにおいがしました。', en: 'I could smell the food stalls.' },
      { ja: 'たこやきを一つ買いました。', reading: 'たこやきをひとつかいました。', en: 'I bought one takoyaki.' },
      { ja: 'あつすぎて、口をやけどしそうでした。', reading: 'あつすぎて、くちをやけどしそうでした。', en: 'It was so hot I almost burned my mouth.' },
      { ja: 'ともだちと花火を見ました。', reading: 'ともだちとはなびをみました。', en: 'I watched fireworks with a friend.' },
      { ja: '空が金色に光りました。', reading: 'そらがきんいろにひかりました。', en: 'The sky shone gold.' },
      { ja: 'また来年も来たいです。', reading: 'またらいねんもきたいです。', en: 'I want to come again next year.' },
    ],
  },
  {
    slug: 'new-neighbor',
    level: 3,
    order: 3,
    titleJa: 'あたらしいとなりのひと',
    titleEn: 'The New Neighbor',
    summary: 'Meeting someone who just moved in.',
    theme: 'people',
    sentences: [
      { ja: 'きのう、となりに人がひっこしてきました。', reading: 'きのう、となりにひとがひっこしてきました。', en: 'Yesterday, someone moved in next door.' },
      { ja: '若い女性で、にこにこしていました。', reading: 'わかいじょせいで、にこにこしていました。', en: 'She was a young woman, smiling.' },
      { ja: '「よろしくおねがいします。」と言いました。', reading: '「よろしくおねがいします。」といいました。', en: 'She said, "Nice to meet you."' },
      { ja: 'わたしはクッキーをあげました。', reading: 'わたしはクッキーをあげました。', en: 'I gave her cookies.' },
      { ja: '彼女は東京から来たそうです。', reading: 'かのじょはとうきょうからきたそうです。', en: 'Apparently she came from Tokyo.' },
      { ja: 'しごとが近くにあるそうです。', reading: 'しごとがちかくにあるそうです。', en: 'She said her job is nearby.' },
      { ja: 'また話したいと思いました。', reading: 'またはなしたいとおもいました。', en: 'I thought I would like to talk again.' },
      { ja: 'あたらしい友達ができるかもしれません。', reading: 'あたらしいともだちができるかもしれません。', en: 'Maybe I will make a new friend.' },
    ],
  },

  // ─── Level 4 · N4–N3 · longer narrative ────────────────────────────────
  {
    slug: 'old-bookstore',
    level: 4,
    order: 1,
    titleJa: 'ふるい本屋さん',
    titleEn: 'The Old Bookstore',
    summary: 'Discovering a quiet shop on a side street.',
    theme: 'places',
    sentences: [
      { ja: 'まちのうらどおりに、小さな本屋があります。', reading: 'まちのうらどおりに、ちいさなほんやがあります。', en: 'On a back street of town, there is a small bookstore.' },
      { ja: 'のれんが古くて、風でゆれています。', reading: 'のれんがふるくて、かぜでゆれています。', en: 'The noren curtain is old and sways in the wind.' },
      { ja: '中に入ると、紙のにおいがしました。', reading: 'なかにはいると、かみのにおいがしました。', en: 'When I went inside, it smelled of paper.' },
      { ja: 'おじいさんがめがねをかけて本を読んでいました。', reading: 'おじいさんがめがねをかけてほんをよんでいました。', en: 'An old man with glasses was reading a book.' },
      { ja: '「何か探していますか？」と聞いてくれました。', reading: '「なにかさがしていますか？」ときいてくれました。', en: 'He asked me, "Are you looking for something?"' },
      { ja: 'わたしは昔話の本が欲しいと言いました。', reading: 'わたしはむかしばなしのほんがほしいといいました。', en: 'I said I wanted a book of old tales.' },
      { ja: '彼はほこりっぽい棚から一さつ取り出してくれました。', reading: 'かれはほこりっぽいたなからいっさつとりだしてくれました。', en: 'He pulled one volume from a dusty shelf for me.' },
      { ja: '表紙には桜が描いてありました。', reading: 'ひょうしにはさくらがえがいてありました。', en: 'Cherry blossoms were drawn on the cover.' },
      { ja: 'その本を買って、夕方まで読み続けました。', reading: 'そのほんをかって、ゆうがたまでよみつづけました。', en: 'I bought that book and kept reading until evening.' },
      { ja: 'またあの店に行きたいです。', reading: 'またあのみせにいきたいです。', en: 'I want to go to that shop again.' },
    ],
  },
  {
    slug: 'mountain-path',
    level: 4,
    order: 2,
    titleJa: '山のみち',
    titleEn: 'The Mountain Path',
    summary: 'A hike that teaches patience.',
    theme: 'nature',
    sentences: [
      { ja: '朝早く、山に登りはじめました。', reading: 'あさはやく、やまにのぼりはじめました。', en: 'Early in the morning, I began climbing the mountain.' },
      { ja: '空気が冷たくて、息が白くなりました。', reading: 'くうきがつめたくて、いきがしろくなりました。', en: 'The air was cold and my breath turned white.' },
      { ja: '急な坂で、足が重く感じました。', reading: 'きゅうなさかで、あしがおもくかんじました。', en: 'On the steep slope, my legs felt heavy.' },
      { ja: 'でも、鳥の声を聞いて元気が出ました。', reading: 'でも、とりのこえをきいてげんきがでました。', en: 'But hearing the birds gave me energy.' },
      { ja: '途中で小さな神社を見つけました。', reading: 'とちゅうでちいさなじんじゃをみつけました。', en: 'Along the way I found a small shrine.' },
      { ja: '手を合わせて、静かに祈りました。', reading: 'てをあわせて、しずかにいのりました。', en: 'I put my hands together and prayed quietly.' },
      { ja: '頂上からの景色は、言葉では足りませんでした。', reading: 'ちょうじょうからのけしきは、ことばではたりませんでした。', en: 'The view from the summit could not be put into words.' },
      { ja: '雲の上に、町が小さく見えていました。', reading: 'くものうえに、まちがちいさくみえていました。', en: 'Above the clouds, the town looked tiny.' },
      { ja: '下りは楽でしたが、心はまだ山にいました。', reading: 'くだりはらくでしたが、こころはまだやまにいました。', en: 'The descent was easy, but my heart was still on the mountain.' },
    ],
  },
  {
    slug: 'letter-from-friend',
    level: 4,
    order: 3,
    titleJa: '友だちからの手紙',
    titleEn: 'A Letter from a Friend',
    summary: 'News from someone far away.',
    theme: 'people',
    sentences: [
      { ja: 'ポストに一通の手紙が入っていました。', reading: 'ポストにいっつうのてがみがはいっていました。', en: 'There was a letter in the mailbox.' },
      { ja: '差出人は、昔のクラスメートでした。', reading: 'さしだしにんは、むかしのクラスメートでした。', en: 'The sender was an old classmate.' },
      { ja: '彼女は今、大阪で働いているそうです。', reading: 'かのじょはいま、おおさかではたらいているそうです。', en: 'Apparently she works in Osaka now.' },
      { ja: '手紙には写真が一枚入っていました。', reading: 'てがみにはしゃしんがいちまい入っていました。', en: 'There was one photo inside the letter.' },
      { ja: '橋の前で、大きく手を振っていました。', reading: 'はしのまえで、おおくてをふっていました。', en: 'In front of a bridge, she was waving big.' },
      { ja: '「今度会いましょう」と書いてありました。', reading: '「こんどあいましょう」とかいてありました。', en: 'It said, "Let\'s meet next time."' },
      { ja: 'すぐに返事を書きたくなりました。', reading: 'すぐにへんじをかきたくなりました。', en: 'I immediately wanted to write a reply.' },
      { ja: '遠い友だちでも、心は近くにいるんだと思いました。', reading: 'とおいともだちでも、こころはちかくにいるんだとおもいました。', en: 'I thought that even distant friends stay close in the heart.' },
    ],
  },

  // ─── Level 5 · N3 · richer prose ───────────────────────────────────────
  {
    slug: 'sakura-memory',
    level: 5,
    order: 1,
    titleJa: '桜のきおく',
    titleEn: 'A Memory of Sakura',
    summary: 'Remembering spring under the cherry trees.',
    theme: 'seasons',
    sentences: [
      { ja: '春になると、毎年あの道を歩きたくなります。', reading: 'はるになると、まいとしあのみちをあるきたくなります。', en: 'When spring comes, I want to walk that road every year.' },
      { ja: '両側の桜が、まるでトンネルのようです。', reading: 'りょうがわのさくらが、まるでトンネルのようです。', en: 'The cherry trees on both sides are like a tunnel.' },
      { ja: '花びらが風に乗って、ゆっくり落ちてきます。', reading: 'はなびらがかぜにのって、ゆっくりおちてきます。', en: 'Petals ride the wind and fall slowly.' },
      { ja: '子供のころ、父とここで弁当を食べました。', reading: 'こどものころ、ちちとここでべんとうをたべました。', en: 'As a child, I ate a bento here with my father.' },
      { ja: 'そのときの話は、もうあまり覚えていません。', reading: 'そのときのはなしは、もうあまりおぼえていません。', en: 'I barely remember the conversations from then.' },
      { ja: 'でも、桜の香りだけは、今でもはっきりしています。', reading: 'でも、さくらのかおりだけは、いまでもはっきりしています。', en: 'But the scent of sakura alone is still clear even now.' },
      { ja: '人は思い出を忘れるけれど、季節は同じように戻ってきます。', reading: 'ひとはおもいでをわすれるけれど、きせつはおなじようにもどってきます。', en: 'People forget memories, but seasons return the same way.' },
      { ja: 'だから私は、春が来るたびにここに立ちます。', reading: 'だからわたしは、はるがくるたびにここにたちます。', en: 'So every time spring comes, I stand here.' },
      { ja: '静かに空を見上げて、ありがとうとつぶやきます。', reading: 'しずかにそらをみあげて、ありがとうとつぶやきます。', en: 'I quietly look up at the sky and whisper thank you.' },
    ],
  },
  {
    slug: 'night-market',
    level: 5,
    order: 2,
    titleJa: '夜のいちば',
    titleEn: 'The Night Market',
    summary: 'Lanterns, voices, and a choice at a stall.',
    theme: 'culture',
    sentences: [
      { ja: '夕方を過ぎると、広場に赤いちょうちんがともります。', reading: 'ゆうがたをすぎると、ひろばにあかいちょうちんがともります。', en: 'After evening falls, red lanterns light up the square.' },
      { ja: '人の声と笑いが、波のように広がっていきます。', reading: 'ひとのこえとわらいが、なみのようにひろがっていきます。', en: 'Voices and laughter spread like waves.' },
      { ja: '焼きそばの煙が、甘い醤油のにおいを運んできます。', reading: 'やきそばのけむりが、あまいしょうゆのにおいをはこんできます。', en: 'Yakisoba smoke carries a sweet soy scent.' },
      { ja: '私は迷っていました。甘いかき氷か、しょっぱいたこ焼きか。', reading: 'わたしはまよっていました。あまいかきごおりか、しょっぱいたこやきか。', en: 'I was undecided: sweet shaved ice, or salty takoyaki?' },
      { ja: '店のおかみさんが、「どっちもいいよ」と笑いました。', reading: 'みせのおかみさんが、「どっちもいいよ」とわらいました。', en: 'The stall owner laughed, "Either is fine."' },
      { ja: '結局、小さく両方を頼みました。', reading: 'けっきょく、ちいさくりょうほうをたのみました。', en: 'In the end, I ordered a little of both.' },
      { ja: '夜の市場では、正しい答えより楽しい選択が大事なのです。', reading: 'よるのいちばでは、ただしいこたえよりたのしいせんたくがだいじなのです。', en: 'At a night market, a joyful choice matters more than the right answer.' },
      { ja: '帰りの道でも、口の中にあの味が残っていました。', reading: 'かえりのみちでも、くちのなかにあのあじがのこっていました。', en: 'Even on the way home, that taste lingered in my mouth.' },
    ],
  },
  {
    slug: 'bridge-promise',
    level: 5,
    order: 3,
    titleJa: 'はしの約束',
    titleEn: 'A Promise on the Bridge',
    summary: 'Two friends make a vow before parting.',
    theme: 'people',
    sentences: [
      { ja: '川にかかる古い橋の上で、私たちは立ち止まりました。', reading: 'かわにかかるふるいはしのうえで、わたしたちはたちどまりました。', en: 'On the old bridge over the river, we stopped.' },
      { ja: '来月から、彼は遠くの町へ引っ越します。', reading: 'らいげつから、かれはとおいのまちへひっこします。', en: 'From next month, he is moving to a far town.' },
      { ja: '風が強くて、髪が目に入りました。', reading: 'かぜがつよくて、かみがめにはいりました。', en: 'The wind was strong and hair got in my eyes.' },
      { ja: '「忘れないでね」と、彼が小さく言いました。', reading: '「わすれないでね」と、かれがちいさくいいました。', en: 'He said softly, "Don\'t forget."' },
      { ja: '私はうなずいて、小指を差し出しました。', reading: 'わたしはうなずいて、こゆびをさしだしました。', en: 'I nodded and held out my pinky.' },
      { ja: '指切りげんまんで、約束を結びました。', reading: 'ゆびきりげんまんで、やくそくをむすびました。', en: 'We sealed the promise with a pinky swear.' },
      { ja: '下を流れる水は、止まるで止まらず、先へ進みます。', reading: 'したをながれるみずは、とまるでとまらず、さきへすすみます。', en: 'The water below never stops; it keeps moving forward.' },
      { ja: '人も同じだと、そのとき初めて分かりました。', reading: 'ひともおなじだと、そのときはじめてわかりました。', en: 'That was when I first understood people are the same.' },
      { ja: 'それでも、約束だけは橋の上に残ると信じています。', reading: 'それでも、やくそくだけははしのうえにのこるとしんじています。', en: 'Even so, I believe the promise alone remains on the bridge.' },
    ],
  },
];

/** Fix a typo that snuck into lost-umbrella seed text if any. */
function cleanSentence(s: StorySentence): StorySentence {
  return {
    ja: s.ja.replace(/Conserv\s*/g, ''),
    reading: s.reading.replace(/Conserv\s*/g, ''),
    en: s.en,
  };
}

export async function ensureStoriesSeeded() {
  const count = await prisma.story.count();
  if (count > 0) return { seeded: false, count };

  for (const seed of STORY_SEEDS) {
    await prisma.story.create({
      data: {
        slug: seed.slug,
        level: seed.level,
        order: seed.order,
        titleJa: seed.titleJa,
        titleEn: seed.titleEn,
        summary: seed.summary,
        theme: seed.theme,
        sentences: seed.sentences.map(cleanSentence),
      },
    });
  }
  return { seeded: true, count: STORY_SEEDS.length };
}

export async function listStories(userId: string) {
  await ensureStoriesSeeded();
  const stories = await prisma.story.findMany({
    orderBy: [{ level: 'asc' }, { order: 'asc' }],
  });
  const progress = await prisma.userStoryProgress.findMany({ where: { userId } });
  const byStory = new Map(progress.map((p) => [p.storyId, p]));

  const completedByLevel: Record<number, number> = {};
  for (const p of progress) {
    if (!p.completed) continue;
    const st = stories.find((s) => s.id === p.storyId);
    if (!st) continue;
    completedByLevel[st.level] = (completedByLevel[st.level] || 0) + 1;
  }

  const levels = [1, 2, 3, 4, 5].map((level) => {
    const unlocked = level === 1 || (completedByLevel[level - 1] || 0) >= 1;
    const items = stories
      .filter((s) => s.level === level)
      .map((s) => {
        const p = byStory.get(s.id);
        const sentences = s.sentences as StorySentence[];
        return {
          id: s.id,
          slug: s.slug,
          level: s.level,
          order: s.order,
          titleJa: s.titleJa,
          titleEn: s.titleEn,
          summary: s.summary,
          theme: s.theme,
          sentenceCount: Array.isArray(sentences) ? sentences.length : 0,
          progress: {
            sentenceIndex: p?.sentenceIndex ?? 0,
            completed: p?.completed ?? false,
            bestScore: p?.bestScore ?? 0,
          },
        };
      });
    return {
      level,
      label: LEVEL_LABELS[level],
      unlocked,
      completedCount: completedByLevel[level] || 0,
      stories: items,
    };
  });

  return { levels };
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Level 1 · N5 basics',
  2: 'Level 2 · Daily life',
  3: 'Level 3 · Past & feelings',
  4: 'Level 4 · Short stories',
  5: 'Level 5 · Rich prose',
};

export async function getStory(userId: string, storyId: string) {
  await ensureStoriesSeeded();
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');

  const p = await prisma.userStoryProgress.findUnique({
    where: { userId_storyId: { userId, storyId } },
  });

  // Soft unlock check
  if (story.level > 1) {
    const completed = await prisma.userStoryProgress.findMany({
      where: { userId, completed: true },
      select: { storyId: true },
    })
    const prevStories = await prisma.story.findMany({
      where: { level: story.level - 1 },
      select: { id: true },
    })
    const prevIds = new Set(prevStories.map((s) => s.id))
    const prevDone = completed.filter((c) => prevIds.has(c.storyId)).length
    if (prevDone < 1) {
      return {
        locked: true as const,
        level: story.level,
        message: `Finish at least one Level ${story.level - 1} story to unlock this level.`,
        story: null,
      };
    }
  }

  return {
    locked: false as const,
    story: {
      id: story.id,
      slug: story.slug,
      level: story.level,
      titleJa: story.titleJa,
      titleEn: story.titleEn,
      summary: story.summary,
      theme: story.theme,
      sentences: story.sentences as StorySentence[],
      progress: {
        sentenceIndex: p?.sentenceIndex ?? 0,
        completed: p?.completed ?? false,
        bestScore: p?.bestScore ?? 0,
      },
    },
  };
}

export const PASS_THRESHOLD = 50;

export async function advanceStory(
  userId: string,
  storyId: string,
  opts: { sentenceIndex: number; score?: number; complete?: boolean }
) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');
  const sentences = Array.isArray(story.sentences)
    ? (story.sentences as StorySentence[])
    : [];
  if (!sentences.length) throw new Error('Story has no sentences');

  const maxIdx = sentences.length - 1;
  // Clamp; treat "past the end" as finished
  let sentenceIndex = Math.floor(Number(opts.sentenceIndex) || 0);
  if (sentenceIndex < 0) sentenceIndex = 0;
  if (sentenceIndex > maxIdx) sentenceIndex = maxIdx;

  const score = Math.min(100, Math.max(0, Math.round(Number(opts.score) || 0)));
  // Complete only when the client says so, or when index is on the last line
  // AND complete flag is set. Landing on the last line alone is NOT enough —
  // user must Skip/Pass the final line (complete: true) to unlock the next level.
  const shouldComplete = Boolean(opts.complete) && sentenceIndex >= maxIdx;

  const existing = await prisma.userStoryProgress.findUnique({
    where: { userId_storyId: { userId, storyId } },
  });

  const progress = await prisma.userStoryProgress.upsert({
    where: { userId_storyId: { userId, storyId } },
    create: {
      userId,
      storyId,
      sentenceIndex,
      completed: shouldComplete,
      bestScore: score,
    },
    update: {
      sentenceIndex: Math.max(existing?.sentenceIndex ?? 0, sentenceIndex),
      completed: shouldComplete || existing?.completed || false,
      bestScore: Math.max(existing?.bestScore ?? 0, score),
    },
  });

  let xpGained = 0;
  const justCompleted = progress.completed && !existing?.completed;
  if (justCompleted) {
    xpGained = 20 + story.level * 8;
    await awardProgress(userId, { xpGained, source: 'story' });
    try {
      const { completeQuest, addDailyXp } = await import('./learningService');
      await addDailyXp(userId, xpGained);
      await completeQuest(userId, 'story', 'story');
    } catch {
      /* quests optional if not yet wired */
    }
  } else if (score >= PASS_THRESHOLD) {
    xpGained = 3;
    await awardProgress(userId, { xpGained, source: 'story' });
  }

  return {
    progress,
    xpGained,
    justCompleted,
    level: story.level,
    unlockedNext: progress.completed,
  };
}

/**
 * Read-aloud scoring for Japanese.
 * Browsers often return kanji (朝です) when the line is hiragana (あさです),
 * so positional char match alone is useless — we score several normalizations
 * and take the best.
 */
function stripJa(s: string) {
  return s
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/[「」『』【】（）()。、！？!?.,…・〜~♪]/g, '')
    .replace(/ー/g, '');
}

/** Keep hiragana / katakana / prolonged sound; drop kanji & latin. */
function kanaOnly(s: string) {
  return stripJa(s).replace(/[^\u3040-\u309F\u30A0-\u30FF]/g, '');
}

function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m || !n) return 0;
  // rolling two rows to keep it light
  let prev = new Array(n + 1).fill(0);
  let cur = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  return prev[n];
}

function orderedCoverage(expected: string, heard: string): number {
  if (!expected) return 0;
  let ei = 0;
  for (let i = 0; i < heard.length && ei < expected.length; i++) {
    if (heard[i] === expected[ei]) ei++;
  }
  return ei / expected.length;
}

function scorePair(expected: string, heard: string): number {
  const a = stripJa(expected);
  const b = stripJa(heard);
  if (!a || !b) return 0;
  if (a === b) return 100;

  const scores: number[] = [];

  // containment (short utterance inside longer expected, or vice versa)
  if (a.includes(b) || b.includes(a)) {
    scores.push(Math.round((Math.min(a.length, b.length) / Math.max(a.length, b.length)) * 100));
  }

  const lcs = lcsLength(a, b);
  scores.push(Math.round((lcs / Math.max(a.length, b.length)) * 100));
  scores.push(Math.round(orderedCoverage(a, b) * 100));

  // Kana-only: 朝です → です vs あさです → still catches polite endings
  const ka = kanaOnly(a);
  const kb = kanaOnly(b);
  if (ka && kb) {
    if (ka === kb) scores.push(100);
    if (ka.includes(kb) || kb.includes(ka)) {
      scores.push(Math.round((Math.min(ka.length, kb.length) / Math.max(ka.length, kb.length)) * 100));
    }
    scores.push(Math.round((lcsLength(ka, kb) / Math.max(ka.length, kb.length)) * 100));
    scores.push(Math.round(orderedCoverage(ka, kb) * 100));
  }

  // Shared ending boost (です / ます / でした …)
  const endings = ['でした', 'ます', 'です', 'だよ', 'だね', 'たい', 'ない'];
  for (const end of endings) {
    if (a.endsWith(end) && b.endsWith(end) && a.length >= end.length && b.length >= end.length) {
      scores.push(58);
      break;
    }
  }

  return Math.max(0, ...scores);
}

/** Score heard speech against Japanese line and optional furigana reading. */
export function scoreReading(expected: string, heard: string, reading?: string): number {
  const scores = [scorePair(expected, heard)];
  if (reading && reading.trim()) {
    scores.push(scorePair(reading, heard));
  }
  return Math.min(100, Math.max(0, Math.round(Math.max(...scores))));
}
