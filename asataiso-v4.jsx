import { useState, useEffect, useRef } from "react";

// ================= カラー =================
const C = {
  skyTop: "#FFE3C7", skyBottom: "#DCEBF5",
  ink: "#33465C", inkSoft: "#7A8CA0",
  sun: "#FF9E4F", sunDeep: "#F2803B",
  card: "rgba(255,255,255,0.72)", done: "#FFB169", path: "#F6D3AE",
  shirt: "#FF9E4F", pants: "#5B7A9E", skin: "#FBD3A8", skinLine: "#E8A96F",
  hair: "#6B4A2E", shoe: "#38506B", prop: "#B9A88F", panelBg: "#FFF9F1", panelBd: "#F3E2CC",
};

// ================= 汎用描画 =================
const Ln = ({ d, c, w, dash }) =>
  d[0] === "M" ? (
    <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "5 4" : undefined} />
  ) : (
    <polyline points={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "5 4" : undefined} />
  );

function Head({ at, side }) {
  const [x, y, r = 0] = at;
  return (
    <g transform={`translate(${x},${y}) rotate(${r})`}>
      <circle r="11.5" fill={C.skin} stroke={C.skinLine} strokeWidth="1.5" />
      <path d="M -11.5 -3 A 11.5 11.5 0 0 1 11.5 -3 L 9.5 -6 A 9.5 9.5 0 0 0 -9.5 -6 Z" fill={C.hair} />
      {side ? (
        <>
          <circle cx="5" cy="0" r="1.4" fill="#4A3423" />
          <path d="M 3 5.5 q 3 2 5.5 -0.5" stroke="#C97B4A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-4.5" cy="0" r="1.5" fill="#4A3423" />
          <circle cx="4.5" cy="0" r="1.5" fill="#4A3423" />
          <path d="M -3 6 q 3 2.5 6 0" stroke="#C97B4A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function Body({ p }) {
  return (
    <>
      <line x1="10" y1="132" x2="100" y2="132" stroke="#D8C7B4" strokeWidth="3" strokeLinecap="round" />
      {p.props?.map((d, i) => <Ln key={`pr${i}`} d={d} c={C.prop} w={4} />)}
      {p.band && <Ln d={p.band} c={C.sunDeep} w={2.5} dash />}
      {p.legR && <Ln d={p.legR} c={C.pants} w={10} />}
      {p.legL && <Ln d={p.legL} c={C.pants} w={10} />}
      {p.feet?.map(([x, y], i) => <ellipse key={`f${i}`} cx={x} cy={y} rx="7.5" ry="3" fill={C.shoe} />)}
      {p.torso && <Ln d={p.torso} c={C.shirt} w={p.tw || 20} />}
      {p.armR && <Ln d={p.armR} c="#F0BE8D" w={7} />}
      {p.armL && <Ln d={p.armL} c={C.skin} w={7} />}
      {p.dots?.map(([x, y], i) => <circle key={`d${i}`} cx={x} cy={y} r="4" fill={C.skin} stroke={C.skinLine} strokeWidth="1" />)}
      {p.head && <Head at={p.head} side={p.side} />}
      {p.arrows?.map((d, i) => <Ln key={`a${i}`} d={d} c={C.sunDeep} w={2.5} />)}
      {p.label && (
        <text x={p.label[1]} y={p.label[2]} fontSize="12" fontWeight="bold" fill={C.sunDeep} textAnchor="middle">{p.label[0]}</text>
      )}
    </>
  );
}

// ================= 基本ポーズ =================
// 正面立位
const ST = {
  torso: "55,52 55,92", tw: 22,
  armL: "46,58 41,88", armR: "64,58 69,88",
  legL: "50,92 48,126", legR: "60,92 62,126",
  feet: [[46, 129], [64, 129]], head: [55, 33],
};
// 横向き立位（右向き）
const SD = {
  torso: "57,52 57,88", tw: 18,
  armL: "55,58 53,84",
  legL: "55,88 53,126", legR: "60,88 59,126",
  feet: [[62, 129]], head: [56, 34], side: 1,
};
// 脚を横に開いた正面立位
const STW = { ...ST, legL: "50,92 40,126", legR: "60,92 70,126", feet: [[38, 129], [72, 129]] };
const q = (b, o) => ({ ...b, ...o });

// ================= ラジオ体操：公式PDFの手順に基づく連続コマ =================
const P_UDEFURI = [
  { p: q(ST, { torso: "55,50 55,90", legL: "50,90 48,122", legR: "60,90 62,122", feet: [[46, 125], [64, 125]], armL: "46,56 66,74", armR: "64,56 44,74", head: [55, 31], arrows: ["M 30 130 L 30 122 M 27 126 L 30 121 L 33 126"] }), cap: "かかとを上げ、腕を前で交差" },
  { p: q(ST, { torso: "55,56 55,94", head: [55, 37], armL: "46,62 22,56", armR: "64,62 88,56", legL: "50,94 43,110 46,126", legR: "60,94 67,110 64,126" }), cap: "腕を横に振り、脚を曲げ伸ばす" },
  { p: q(ST, { torso: "55,50 55,90", legL: "50,90 48,122", legR: "60,90 62,122", feet: [[46, 125], [64, 125]], armL: "46,56 66,74", armR: "64,56 44,74", head: [55, 31], arrows: ["M 90 58 L 90 74 M 86 68 L 90 75 L 94 68", "M 96 74 L 96 58 M 92 64 L 96 57 L 100 64"] }), cap: "振り戻して交差、かかと下→上" },
];

const MOVEMENTS = [
  {
    name: "伸びの運動", dur: 14, reps: "2回", hint: "腕をよく伸ばし、ゆっくり高く。背すじも一緒に伸ばす",
    panels: [
      { p: q(ST, {}), cap: "かかとをつけて直立" },
      { p: q(ST, { torso: "55,48 55,92", armL: "46,54 41,16", armR: "64,54 69,16", head: [55, 29], arrows: ["M 22 88 Q 8 52 20 22 M 14 28 L 20 20 L 24 29"] }), br: "in", cap: "吸いながら腕を前から高く" },
      { p: q(ST, { armL: "46,56 26,76", armR: "64,56 84,76", arrows: ["M 20 42 Q 12 60 18 78 M 13 71 L 18 80 L 23 72", "M 90 42 Q 98 60 92 78 M 87 71 L 92 80 L 97 72"] }), br: "out", cap: "吐きながら横から下ろす" },
    ],
  },
  { name: "腕を振って脚を曲げ伸ばす運動", dur: 14, reps: "8回", hint: "かかとの上下は腕の振りに合わせてリズミカルに", panels: P_UDEFURI },
  {
    name: "腕を回す運動", dur: 10, reps: "各2回", hint: "腕と肩の力を抜き、遠心力で大きく回す",
    panels: [
      { p: q(ST, { armL: "46,58 24,42", armR: "64,58 86,42", arrows: ["M 14 68 A 34 34 0 0 1 42 10 M 34 12 L 43 8 L 41 18"] }), cap: "外から内へ大きく回す ×2" },
      { p: q(ST, { armL: "46,58 24,42", armR: "64,58 86,42", arrows: ["M 96 68 A 34 34 0 0 0 68 10 M 76 12 L 67 8 L 69 18"] }), cap: "反対回しも同様に ×2" },
    ],
  },
  {
    name: "胸を反らす運動", dur: 14, reps: "2回", hint: "深い呼吸を心がけ、顔は上を向きすぎない",
    panels: [
      { p: q(STW, { armL: "46,58 22,54", armR: "64,58 88,54", arrows: ["M 44 130 L 32 130 M 37 126 L 30 130 L 37 134"] }), cap: "脚を横に開き、腕を横に振る" },
      { p: q(STW, { armL: "46,54 26,22", armR: "64,54 84,22", head: [55, 30, -4], arrows: ["M 24 44 L 18 30 M 15 37 L 17 28 L 24 32", "M 86 44 L 92 30 M 86 32 L 93 28 L 95 37"] }), br: "in", cap: "吸って腕を斜め上へ、胸を反らす" },
      { p: q(STW, { armL: "46,58 40,86", armR: "64,58 70,86", arrows: ["M 30 56 Q 26 70 34 82 M 28 76 L 35 83 L 37 75"] }), br: "out", cap: "吐きながら振り下ろす" },
    ],
  },
  {
    name: "体を横に曲げる運動", dur: 12, reps: "左右×2", hint: "前かがみにならず、腕は真横の面で上げる",
    panels: [
      { p: q(STW, {}), cap: "脚を横に開く" },
      { p: q(STW, { torso: "M 55 92 Q 52 72 44 58", tw: 20, head: [38, 46, -22], armR: "48,60 26,36", armL: "50,66 56,86", label: ["×2", 88, 40], arrows: ["M 78 28 Q 62 16 44 22 M 51 18 L 42 24 L 50 29"] }), cap: "片腕を上げ、真横に曲げる" },
      { p: q(STW, { torso: "M 55 92 Q 58 72 66 58", tw: 20, head: [72, 46, 22], armL: "62,60 84,36", armR: "60,66 54,86", arrows: ["M 32 28 Q 48 16 66 22 M 59 18 L 68 24 L 60 29"] }), cap: "反対側も同様に" },
    ],
  },
  {
    name: "体を前後に曲げる運動", dur: 14, reps: "全体2回", hint: "前屈は首・肩の力を抜き、上半身の重みにまかせる",
    panels: [
      { p: q(SD, { torso: "M 57 88 Q 68 94 73 106", tw: 18, head: [79, 116, 80], armL: "71,104 66,122", arrows: ["M 94 90 L 94 104 M 90 98 L 94 105 L 98 98"], label: ["×3", 90, 84] }), br: "out", cap: "力を抜いて前屈、弾み×3" },
      { p: q(SD, { arrows: ["M 90 100 L 90 76 M 86 83 L 90 75 L 94 83"] }), cap: "上体を起こす" },
      { p: q(SD, { torso: "M 58 88 Q 52 70 47 56", tw: 18, head: [42, 45, -18], armL: "M 49 60 Q 62 66 60 80", dots: [[60, 82]], arrows: ["M 28 76 Q 18 62 26 46 M 21 53 L 26 44 L 32 51"] }), br: "in", cap: "両手を腰の後ろに当て反らす" },
    ],
  },
  {
    name: "体をねじる運動", dur: 14, reps: "各2回", hint: "腕の勢いにつられて脚が動かないように",
    panels: [
      { p: q(ST, { armL: "46,58 20,50", armR: "64,60 30,68", arrows: ["M 80 42 Q 62 32 42 38 M 49 34 L 40 39 L 48 44"] }), cap: "腕を振り、左右左右とねじる" },
      { p: q(ST, { armL: "46,56 22,26", armR: "64,58 34,44", head: [52, 31, -10], arrows: ["M 82 68 Q 92 44 72 28 M 78 26 L 69 26 L 74 35"] }), cap: "腕を斜め上へ、らせん状に大きく" },
    ],
  },
  {
    name: "腕を上下に伸ばす運動", dur: 12, reps: "4回", hint: "号令をかけるつもりで、力強く素早く",
    panels: [
      { p: q(STW, { armL: "46,58 38,72 46,62", armR: "64,58 72,72 64,62" }), cap: "脚を開き、手先を肩・脇を締める" },
      { p: q(STW, { torso: "55,48 55,90", legL: "50,90 40,122", legR: "60,90 70,122", feet: [[38, 125], [72, 125]], armL: "46,54 41,14", armR: "64,54 69,14", head: [55, 29], arrows: ["M 20 60 L 20 34 M 16 41 L 20 33 L 24 41", "M 30 130 L 30 123"] }), cap: "素早く腕を上へ！かかとも上げる" },
      { p: q(STW, { armL: "46,58 38,72 46,62", armR: "64,58 72,72 64,62", arrows: ["M 90 66 L 90 84 M 86 78 L 90 85 L 94 78"] }), cap: "肩へ戻し、脚を戻して腕を下へ" },
    ],
  },
  {
    name: "体を斜め下に曲げ胸を反らす運動", dur: 14, reps: "左右2回", hint: "反らす時は肘を伸ばし、大きく息を吸う",
    panels: [
      { p: q(STW, { torso: "M 55 92 Q 48 76 38 66", tw: 18, head: [32, 74, 55], armL: "40,66 26,86", armR: "42,68 32,90", label: ["×2", 86, 60], arrows: ["M 82 74 Q 72 86 60 92 M 68 92 L 58 94 L 65 86"] }), cap: "脚を開き、体を斜め下へ2回" },
      { p: q(STW, { armL: "46,54 18,44", armR: "64,54 92,44", head: [55, 31, -4], arrows: ["M 30 36 L 22 28", "M 80 36 L 88 28"] }), br: "in", cap: "起こして大きく吸い、胸を開く" },
    ],
  },
  {
    name: "体を回す運動", dur: 14, reps: "各2回", hint: "肘を伸ばして回すと、胴体全体がほぐれる",
    panels: [
      { p: q(STW, { torso: "M 55 92 Q 50 72 44 58", tw: 20, head: [36, 44, -25], armL: "46,58 26,26", armR: "48,62 34,36", arrows: ["M 88 46 A 36 28 0 1 1 32 20 M 26 27 L 33 18 L 39 27"] }), cap: "両腕で円を描き、左へ大回し" },
      { p: q(STW, { torso: "M 55 92 Q 60 72 66 58", tw: 20, head: [74, 44, 25], armR: "64,58 84,26", armL: "62,62 76,36", arrows: ["M 22 46 A 36 28 0 1 0 78 20 M 71 27 L 78 18 L 84 27"] }), cap: "反対回しも同様に" },
    ],
  },
  {
    name: "両脚で跳ぶ運動", dur: 12, reps: "計8回", hint: "静かにしたい朝は「足踏み」に置き換えOK",
    panels: [
      { p: q(ST, { legL: "50,92 48,120", legR: "60,92 62,120", feet: [[46, 123], [64, 123]], label: ["×4", 88, 50], arrows: ["M 38 130 L 46 130", "M 64 130 L 72 130"] }), cap: "脚をそろえて軽く4回跳ぶ" },
      { p: q(ST, { torso: "55,48 55,90", armL: "46,54 24,26", armR: "64,54 86,26", legL: "50,90 36,116", legR: "60,90 74,116", feet: [[34, 119], [76, 119]], head: [55, 29], label: ["×4", 92, 60], arrows: ["M 28 130 L 40 130", "M 70 130 L 82 130"] }), cap: "腕を上げて開脚跳び4回" },
    ],
  },
  { name: "腕を振って脚を曲げ伸ばす運動", dur: 12, reps: "8回・ゆったり", hint: "整理運動。平常の呼吸に戻るようゆったりと", panels: P_UDEFURI },
  {
    name: "深呼吸", dur: 16, reps: "2回", hint: "腕の動きにとらわれず、深い呼吸を意識する",
    panels: [
      { p: q(ST, { armL: "46,54 41,18", armR: "64,54 69,18", head: [55, 30], arrows: ["M 22 86 Q 10 54 20 26 M 14 32 L 20 24 L 25 32"] }), br: "in", cap: "大きく吸いながら腕を上げる" },
      { p: q(ST, { armL: "46,56 26,76", armR: "64,56 84,76", arrows: ["M 18 44 Q 10 60 16 78 M 11 71 L 16 80 L 21 72"] }), br: "out", cap: "ゆっくり吐き、横から下ろす" },
    ],
  },
];

// ================= トレーニング（weekly_training_v2 全種目・連続コマ） =================
const LIBRARY = [
  {
    id: "core", name: "体幹", icon: "🧘", note: "毎日の土台（共通A）",
    items: [
      {
        id: "deadbug", name: "デッドバグ", dur: 45, reps: "45秒", hint: "腰を床に押しつけたまま。反り腰NG",
        panels: [
          { p: { head: [22, 116], side: 1, torso: "34,122 66,122", tw: 16, armL: "40,120 40,94", legL: "66,122 74,102 92,102", feet: [] }, cap: "仰向け、腕は天井・膝90°" },
          { p: { head: [22, 116], side: 1, torso: "34,122 66,122", tw: 16, armL: "40,120 16,108", legL: "66,122 96,114", arrows: ["M 20 100 L 10 106", "M 90 106 L 100 112"] }, cap: "対角の腕と脚を伸ばす（交互）" },
        ],
      },
      {
        id: "sideplank", name: "サイドプランク左右", dur: 90, switchAt: 45, reps: "45秒×左右", hint: "上側の骨盤をわずかに前へ、肋骨を締める",
        panels: [
          { p: { head: [30, 80], side: 1, torso: "40,88 74,104", tw: 16, legL: "74,104 98,118", armR: "42,90 34,118", props: ["30,120 48,120"], armL: "44,86 50,62", feet: [[100, 121]] }, cap: "肘で支え、体を一直線に" },
          { p: { head: [30, 76], side: 1, torso: "40,84 74,102", tw: 16, legL: "74,102 98,118", armR: "42,86 34,118", props: ["30,120 48,120"], armL: "44,82 50,58", feet: [[100, 121]], arrows: ["M 60 76 L 60 62 M 56 67 L 60 60 L 64 67"] }, cap: "腰を落とさずキープ、45秒で交代" },
        ],
      },
      {
        id: "birddog", name: "バードドッグ", dur: 45, reps: "45秒", hint: "手首は肩の真下、骨盤は床と平行",
        panels: [
          { p: { head: [32, 86], side: 1, torso: "40,92 72,92", tw: 16, armL: "44,92 42,122", legL: "72,92 74,122" }, cap: "四つ這い、手は肩の真下" },
          { p: { head: [30, 82], side: 1, torso: "40,88 72,90", tw: 16, armR: "50,90 50,122", armL: "42,88 14,80", legR: "70,90 72,122", legL: "72,90 100,80", arrows: ["M 20 72 L 10 78", "M 94 72 L 104 78"] }, cap: "対角の手脚を伸ばして静止" },
        ],
      },
      {
        id: "hiplift", name: "ヒップリフト", dur: 45, reps: "45秒", hint: "母趾球〜かかとで押し、上で1秒止める",
        panels: [
          { p: { head: [26, 118], side: 1, torso: "40,124 74,124", tw: 16, legL: "74,124 88,104 92,128", armL: "46,126 60,128", feet: [[94, 130]] }, cap: "仰向けで膝を立てる" },
          { p: { head: [26, 118], side: 1, torso: "40,122 76,96", tw: 16, legL: "76,96 88,104 92,128", armL: "46,124 60,128", feet: [[94, 130]], arrows: ["M 70 86 L 70 72 M 66 77 L 70 70 L 74 77"] }, cap: "お尻を上げて1秒キープ" },
        ],
      },
      {
        id: "pallof", name: "パロフプレス", dur: 45, reps: "45秒", hint: "バンドがなければ片手プランク3秒交互で代用",
        panels: [
          { p: q(SD, { armL: "55,60 46,66", band: "2,64 46,66" }), cap: "バンドを胸の前で構える" },
          { p: q(SD, { armL: "55,60 84,62", band: "2,64 84,62", arrows: ["M 66 50 L 84 50 M 78 46 L 86 50 L 78 54"] }), cap: "押し出して2秒、回旋に耐える" },
        ],
      },
    ],
  },
  {
    id: "lower", name: "下半身", icon: "🦵", note: "火曜メニューより",
    items: [
      {
        id: "squat", name: "テンポスクワット", dur: 60, reps: "60秒", hint: "膝はつま先の方向へ。母趾球で押す",
        panels: [
          { p: q(SD, { armL: "57,62 84,64" }), cap: "立位、腕は前へ" },
          { p: { head: [44, 54], side: 1, torso: "47,70 52,98", tw: 18, armL: "50,74 84,68", legL: "52,98 70,106 68,126", legR: "54,100 50,126", feet: [[72, 129]], arrows: ["M 90 84 L 90 100 M 86 94 L 90 101 L 94 94"], label: ["3秒", 92, 78] }, cap: "お尻を後ろへ、3秒かけて沈む" },
        ],
      },
      {
        id: "lunge", name: "リバースランジ左右", dur: 80, switchAt: 40, reps: "40秒×左右", hint: "前膝はつま先方向。母趾球で押して戻る",
        panels: [
          { p: q(SD, {}), cap: "立位" },
          { p: { head: [47, 44], side: 1, torso: "48,62 50,94", tw: 18, armL: "47,66 46,88", legL: "50,94 42,110 42,128", legR: "50,94 74,114 88,128", feet: [[44, 130]], arrows: ["M 66 122 L 84 122 M 78 118 L 86 122 L 78 126"] }, cap: "片脚を後ろへ引いて沈む、40秒で交代" },
        ],
      },
      {
        id: "hinge", name: "ヒップヒンジ", dur: 60, reps: "60秒", hint: "背中はまっすぐ、股関節から曲げる",
        panels: [
          { p: q(SD, {}), cap: "立位" },
          { p: { head: [28, 54, -30], side: 1, torso: "56,92 34,64", tw: 18, armL: "40,68 42,92", legL: "56,92 54,126", legR: "61,92 60,126", feet: [[64, 129]], arrows: ["M 76 86 L 92 86 M 86 82 L 94 86 L 86 90"] }, cap: "お尻を後ろへ引き、背中は一直線" },
        ],
      },
      {
        id: "abduction", name: "ヒップアブダクション左右", dur: 80, switchAt: 40, reps: "40秒×左右", hint: "上で1秒保持。膝の内入り予防に効く",
        panels: [
          { p: { head: [22, 112], side: 1, torso: "34,118 64,118", tw: 15, legL: "64,118 96,122", legR: "64,116 94,112", armL: "38,116 50,106" }, cap: "横向きに寝て体を一直線" },
          { p: { head: [22, 112], side: 1, torso: "34,118 64,118", tw: 15, legR: "64,118 96,122", legL: "64,114 92,90", armL: "38,116 50,106", arrows: ["M 84 84 L 88 72 M 82 76 L 89 70 L 91 79"] }, cap: "上の脚をゆっくり上げ1秒、交代" },
        ],
      },
      {
        id: "calf", name: "カーフレイズ", dur: 45, reps: "45秒", hint: "上で1秒。かかとは音を立てず下ろす",
        panels: [
          { p: q(SD, {}), cap: "まっすぐ立つ" },
          { p: q(SD, { torso: "57,48 57,84", head: [56, 30], armL: "55,54 53,80", legL: "55,84 53,120", legR: "60,84 59,120", feet: [[62, 123]], arrows: ["M 44 130 L 44 118 M 40 124 L 44 116 L 48 124"] }), cap: "かかとを上げて1秒キープ" },
        ],
      },
    ],
  },
  {
    id: "upper", name: "上半身・姿勢", icon: "🙆", note: "木曜メニューより（プル多め）",
    items: [
      {
        id: "incline", name: "インクラインプッシュアップ", dur: 60, reps: "60秒", hint: "台や壁で角度調整。肋骨を締めて一直線",
        panels: [
          { p: { head: [64, 72], side: 1, props: ["64,94 98,94", "68,94 68,130", "94,94 94,130"], legL: "28,126 44,104", torso: "44,104 58,84", tw: 15, armL: "58,86 66,94", feet: [[26, 129]] }, cap: "台に手をつき、体は一直線" },
          { p: { head: [68, 82], side: 1, props: ["64,94 98,94", "68,94 68,130", "94,94 94,130"], legL: "28,128 46,108", torso: "46,108 62,92", tw: 15, armL: "62,92 66,95", feet: [[26, 130]], arrows: ["M 44 78 L 52 88 M 45 86 L 53 90 L 51 82"] }, cap: "肘を曲げ、胸を台へ近づける" },
        ],
      },
      {
        id: "diamond", name: "ダイヤモンドプッシュアップ", dur: 45, reps: "45秒", hint: "手は胸の下で菱形。肘は体側に沿わせる",
        panels: [
          { p: { head: [34, 86], side: 1, torso: "44,94 78,108", tw: 15, legL: "78,108 100,120", armL: "46,96 48,126", dots: [[48, 128]], feet: [[102, 123]] }, cap: "手を菱形に、体は一直線で上" },
          { p: { head: [34, 100], side: 1, torso: "44,106 78,114", tw: 15, legL: "78,114 100,122", armL: "46,108 48,127", dots: [[48, 128]], feet: [[102, 124]], arrows: ["M 30 74 L 30 88 M 26 82 L 30 89 L 34 82"] }, cap: "肘を後ろに曲げて沈む" },
        ],
      },
      {
        id: "row", name: "インバーテッドロウ", dur: 60, reps: "60秒", hint: "頑丈なテーブルで。肩甲骨を寄せて下げる",
        panels: [
          { p: { head: [34, 108], side: 1, props: ["24,80 92,80", "28,80 28,130", "88,80 88,130"], torso: "44,112 74,122", tw: 15, legL: "74,122 94,128", armL: "48,112 52,82", feet: [[96, 130]] }, cap: "テーブル下でぶら下がる" },
          { p: { head: [34, 92], side: 1, props: ["24,80 92,80", "28,80 28,130", "88,80 88,130"], torso: "44,98 74,118", tw: 15, legL: "74,118 94,127", armL: "48,98 52,82", feet: [[96, 130]], arrows: ["M 16 112 L 16 96 M 12 103 L 16 94 L 20 103"] }, cap: "肩甲骨を寄せ、胸を引き上げる" },
        ],
      },
      {
        id: "pullapart", name: "バンドプルアパート", dur: 45, reps: "45秒", hint: "肩をすくめず、肩甲骨を寄せて下げる",
        panels: [
          { p: q(ST, { armL: "46,58 44,76", armR: "64,58 66,76", band: "44,76 66,76" }), cap: "バンドを肩幅で前に持つ" },
          { p: q(ST, { armL: "46,58 20,54", armR: "64,58 90,54", band: "20,54 90,54", arrows: ["M 30 44 L 18 42", "M 80 44 L 92 42"] }), cap: "肩甲骨を寄せて横に開く" },
        ],
      },
      {
        id: "ytw", name: "プローン Y→T→W", dur: 60, reps: "60秒", hint: "可動域＞回数。肩は下げたまま",
        panels: [
          { p: { head: [26, 114], side: 1, torso: "38,118 68,118", tw: 15, legL: "68,118 98,120", armL: "42,116 16,102", arrows: ["M 22 96 L 14 100"] }, cap: "うつ伏せ、腕をYへ" },
          { p: { head: [26, 114], side: 1, torso: "38,118 68,118", tw: 15, legL: "68,118 98,120", armL: "42,116 14,120", armR: "42,116 26,126", arrows: ["M 20 110 Q 12 114 14 122"] }, cap: "T → W へゆっくり動かす" },
        ],
      },
    ],
  },
  {
    id: "cardio", name: "サイレント有酸素", icon: "🔥", note: "月曜HIITより（ノージャンプ）",
    items: [
      {
        id: "stepjack", name: "ステップジャック", dur: 60, reps: "60秒", hint: "ジャンプなしの踏み替え式。着地は無音で",
        panels: [
          { p: q(ST, { armL: "46,54 24,26", armR: "64,54 86,26", legL: "50,92 34,126", legR: "60,92 62,126", feet: [[32, 129], [64, 129]], head: [55, 30], arrows: ["M 44 122 L 30 122 M 36 118 L 28 122 L 36 126"] }), cap: "片脚を横へ、腕を上げる" },
          { p: q(ST, { arrows: ["M 24 60 Q 16 74 22 88", "M 86 60 Q 94 74 88 88"] }), cap: "静かに戻し、左右交互に" },
        ],
      },
      {
        id: "skater", name: "スピードスケーター", dur: 60, reps: "60秒", hint: "着地足の膝はつま先方向。静かに大きく",
        panels: [
          { p: { head: [42, 30, -12], torso: "46,44 52,92", tw: 18, armL: "48,52 28,64", armR: "48,50 68,38", legL: "52,92 42,126", legR: "52,92 76,112", feet: [[40, 129]] }, cap: "片脚に体重、逆脚は後ろへ" },
          { p: { head: [68, 30, 12], torso: "64,44 58,92", tw: 18, armL: "62,50 42,38", armR: "62,52 82,64", legL: "58,92 68,126", legR: "58,92 34,112", feet: [[70, 129]], arrows: ["M 30 100 Q 55 88 80 100 M 72 94 L 82 101 L 72 105"] }, cap: "反対へ静かに跳び移る" },
        ],
      },
      {
        id: "mtclimber", name: "マウンテンクライマー", dur: 45, reps: "45秒", hint: "骨盤を上げすぎない。静かに、でも素早く",
        panels: [
          { p: { head: [28, 76], side: 1, torso: "36,84 66,98", tw: 14, armL: "38,86 36,124", legR: "66,98 94,126", legL: "66,98 50,104 54,120", feet: [[96, 128]] }, cap: "プランクから片膝を胸へ" },
          { p: { head: [28, 76], side: 1, torso: "36,84 66,98", tw: 14, armL: "38,86 36,124", legL: "66,98 94,126", legR: "66,98 76,114 82,128", feet: [[96, 128]], arrows: ["M 84 108 Q 70 100 58 106 M 64 100 L 56 107 L 65 110"] }, cap: "静かに素早く、交互に" },
        ],
      },
      {
        id: "boxing", name: "シャドーボクシング", dur: 60, reps: "60秒", hint: "腰の回旋で打つ。パンチに合わせ息を吐く",
        panels: [
          { p: q(ST, { armL: "46,58 18,50", armR: "64,60 56,70", legL: "50,92 44,126", legR: "60,92 68,124", feet: [[42, 129], [70, 127]], arrows: ["M 34 42 L 18 40 M 25 36 L 16 40 L 25 44"] }), br: "out", cap: "腰を回して左パンチ" },
          { p: q(ST, { armR: "64,58 92,50", armL: "46,60 54,70", legL: "50,92 42,124", legR: "60,92 66,126", feet: [[40, 127], [68, 129]], arrows: ["M 76 42 L 92 40 M 85 36 L 94 40 L 85 44"] }), br: "out", cap: "右パンチ、リズムよく" },
        ],
      },
      {
        id: "bearcrawl", name: "ベアクロール", dur: 45, reps: "45秒", hint: "膝は床から拳1個分。前2歩・後ろ2歩",
        panels: [
          { p: { head: [30, 82], side: 1, torso: "38,90 70,94", tw: 15, armL: "42,92 40,124", legL: "70,94 74,110 82,126", feet: [[84, 128]], arrows: ["M 74 122 L 74 114"] }, cap: "四つ這いで膝を浮かせる" },
          { p: { head: [30, 82], side: 1, torso: "38,90 70,94", tw: 15, armL: "42,92 50,124", legL: "70,94 66,110 74,126", feet: [[76, 128]], arrows: ["M 14 110 L 26 110 M 20 106 L 28 110 L 20 114", "M 104 110 L 92 110 M 98 106 L 90 110 L 98 114"] }, cap: "前へ2歩、後ろへ2歩" },
        ],
      },
    ],
  },
];

const MILESTONES = [7, 30, 100];
const STORAGE_KEY = "asataiso:records";
const MAP_MAX = 100;

// ================= 日付 =================
const dkey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayKey = () => dkey(new Date());

function calcStreak(records) {
  const d = new Date();
  let streak = 0;
  if (!records[dkey(d)]?.t) d.setDate(d.getDate() - 1);
  while (records[dkey(d)]?.t) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ================= 効果音 =================
function beep(freq = 880, dur = 0.12) {
  try {
    const ctx = (beep._ctx ||= new (window.AudioContext || window.webkitAudioContext)());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch (e) {}
}

// ================= 連続コマ表示 =================
function PanelStrip({ panels, reps }) {
  return (
    <div className="w-full">
      <div className="flex items-stretch gap-0.5">
        {panels.map((pn, i) => (
          <div key={i} className="flex-1 min-w-0 flex flex-col" style={{ display: "flex" }}>
            <div className="flex items-stretch h-full">
              <div className="flex-1 flex flex-col min-w-0">
                <div className="relative rounded-xl overflow-hidden" style={{ background: C.panelBg, border: `1.5px solid ${C.panelBd}` }}>
                  <div className="absolute flex items-center justify-center rounded-full font-bold"
                    style={{ top: 3, left: 3, width: 16, height: 16, background: C.ink, color: "#fff", fontSize: 10 }}>
                    {i + 1}
                  </div>
                  {pn.br && (
                    <div className="absolute rounded-full font-bold text-white"
                      style={{ top: 3, right: 3, fontSize: 9, padding: "1px 6px", background: pn.br === "in" ? "#5B8DD9" : "#7AB87A" }}>
                      {pn.br === "in" ? "吸う" : "吐く"}
                    </div>
                  )}
                  <svg viewBox="0 0 110 145" className="block w-full h-auto">
                    <Body p={pn.p} />
                  </svg>
                </div>
                <div className="text-center leading-tight mt-1" style={{ fontSize: 9.5, color: C.ink }}>{pn.cap}</div>
              </div>
              {i < panels.length - 1 && (
                <div className="flex items-center px-0.5 pb-6" style={{ color: C.sunDeep, fontSize: 11 }}>▶</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {reps && (
        <div className="text-center mt-1.5">
          <span className="rounded-full font-bold text-white" style={{ fontSize: 10, padding: "2px 10px", background: C.sunDeep }}>{reps}</span>
        </div>
      )}
    </div>
  );
}

// 一覧用サムネイル（動作コマ1枚）
function Thumb({ item, size = 62 }) {
  const pn = item.panels[item.panels.length - 1];
  return (
    <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ background: C.panelBg, border: `1.5px solid ${C.panelBd}`, width: size, height: size }}>
      <svg viewBox="0 0 110 145" width={size} height={size} style={{ objectFit: "cover" }}>
        <Body p={pn.p} />
      </svg>
    </div>
  );
}

// ================= キャラクター「アサヒ」 =================
function Asahi({ size = 80, mood = "smile", walking = false }) {
  const eyes =
    mood === "sleepy" ? (
      <>
        <path d="M 34 42 q 4 3 8 0" stroke="#7A4A20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 58 42 q 4 3 8 0" stroke="#7A4A20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ) : mood === "star" ? (
      <>
        <text x="32" y="48" fontSize="14">✦</text>
        <text x="56" y="48" fontSize="14">✦</text>
      </>
    ) : (
      <>
        <circle cx="38" cy="43" r="3.5" fill="#7A4A20" />
        <circle cx="62" cy="43" r="3.5" fill="#7A4A20" />
      </>
    );
  const mouth =
    mood === "cheer" || mood === "star" ? (
      <path d="M 42 55 q 8 9 16 0 z" fill="#E0692B" />
    ) : (
      <path d="M 42 55 q 8 7 16 0" stroke="#E0692B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={walking ? { animation: "bob 0.8s ease-in-out infinite" } : {}}>
      {[...Array(10)].map((_, i) => {
        const a = (i * Math.PI) / 5;
        return (
          <line key={i}
            x1={50 + Math.cos(a) * 36} y1={50 + Math.sin(a) * 36}
            x2={50 + Math.cos(a) * 46} y2={50 + Math.sin(a) * 46}
            stroke={C.sunDeep} strokeWidth="5" strokeLinecap="round" />
        );
      })}
      <circle cx="50" cy="50" r="33" fill={C.sun} />
      <circle cx="31" cy="52" r="4.5" fill="#FF7E4F" opacity="0.55" />
      <circle cx="69" cy="52" r="4.5" fill="#FF7E4F" opacity="0.55" />
      {eyes}
      {mouth}
    </svg>
  );
}

function SpeechBubble({ children }) {
  return (
    <div className="relative rounded-2xl px-4 py-3 text-sm leading-relaxed"
      style={{ background: "#fff", color: C.ink, boxShadow: "0 2px 10px rgba(51,70,92,0.08)" }}>
      <div className="absolute w-3 h-3 rotate-45" style={{ background: "#fff", left: -5, top: "50%", marginTop: -6 }} />
      {children}
    </div>
  );
}

// ================= 進行バー（太陽が進む） =================
function SunBar({ progress }) {
  return (
    <div className="relative w-full" style={{ height: 30 }}>
      <div className="absolute rounded-full" style={{ top: 13, left: 14, right: 14, height: 5, background: "rgba(255,255,255,0.85)" }} />
      <div className="absolute rounded-full" style={{ top: 13, left: 14, width: `calc(${Math.min(progress, 1) * 100}% - 28px * ${Math.min(progress, 1)})`, height: 5, background: C.sun }} />
      <div className="absolute" style={{ left: `calc(${Math.min(progress, 1) * 100}% - 28px * ${Math.min(progress, 1)})`, top: 0 }}>
        <Asahi size={28} mood="smile" />
      </div>
    </div>
  );
}

// ================= カレンダー =================
function Calendar({ records }) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const tk = todayKey();
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
          <div key={w} className="text-xs" style={{ color: C.inkSoft }}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const rec = records[key];
          const isToday = key === tk;
          return (
            <div key={i} className="aspect-square flex items-center justify-center rounded-full text-xs relative"
              style={{
                background: rec?.t ? C.done : "transparent",
                color: rec?.t ? "#fff" : C.ink,
                border: isToday && !rec?.t ? `1.5px solid ${C.sunDeep}` : "none",
                fontWeight: isToday ? 700 : 400,
              }}>
              {rec?.t ? "☀" : d}
              {rec?.b?.length > 0 && <div className="absolute -top-0.5 -right-0.5 text-[9px]">⭐</div>}
            </div>
          );
        })}
      </div>
      <div className="text-[10px] mt-2 text-right" style={{ color: C.inkSoft }}>⭐ = トレーニングもやった日</div>
    </div>
  );
}

// ================= 冒険マップ =================
function AdventureMap({ totalDays, onBack }) {
  const W = 340, STEP = 72, PAD = 60;
  const H = PAD * 2 + (MAP_MAX - 1) * STEP;
  const pos = (day) => ({ x: W / 2 + Math.sin(day * 0.9) * 105, y: H - PAD - (day - 1) * STEP });
  const current = Math.min(totalDays, MAP_MAX);
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const y = pos(Math.max(current, 1)).y;
      el.scrollTop = y - el.clientHeight / 2;
    }
  }, []);
  let d = "";
  for (let day = 1; day <= MAP_MAX; day++) {
    const p = pos(day);
    d += day === 1 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`;
  }
  const chapterName = current < 7 ? "第1章：朝のめざめ" : current < 30 ? "第2章：習慣の丘" : "第3章：百日の山";
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-6 pt-6 pb-3">
        <button onClick={onBack} className="text-sm font-bold" style={{ color: C.inkSoft }}>← もどる</button>
        <div className="text-sm font-bold" style={{ color: C.ink }}>{chapterName}</div>
        <div className="text-xs" style={{ color: C.inkSoft }}>{current} / {MAP_MAX}日</div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block">
          <path d={d} fill="none" stroke={C.path} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
          {Array.from({ length: MAP_MAX }, (_, i) => i + 1).map((day) => {
            const p = pos(day);
            const cleared = day <= current;
            const isMile = MILESTONES.includes(day);
            const isCurrent = day === current && current > 0;
            return (
              <g key={day}>
                {isMile && (
                  <text x={p.x} y={p.y - (isCurrent ? 46 : 26)} textAnchor="middle" fontSize="20">
                    {day === 7 ? "🏕" : day === 30 ? "🏯" : "👑"}
                  </text>
                )}
                <circle cx={p.x} cy={p.y} r={isMile ? 17 : 12}
                  fill={cleared ? C.sun : "#fff"}
                  stroke={cleared ? C.sunDeep : "#D8C7B4"} strokeWidth="2.5" />
                {cleared && !isCurrent && (
                  <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize="11" fill="#fff">☀</text>
                )}
                {!cleared && (
                  <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="8" fill="#B9A88F">{day}</text>
                )}
                {isCurrent && (
                  <g transform={`translate(${p.x - 21}, ${p.y - 42})`}>
                    <Asahi size={42} mood="cheer" walking />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-6 py-4 text-center text-xs" style={{ color: C.inkSoft }}>
        マップは<b>合計日数</b>で進みます。1日休んでも、ここは戻りません。
      </div>
    </div>
  );
}

// ================= メイン =================
export default function AsaTaiso() {
  const [screen, setScreen] = useState("home");
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);
  const [newMilestone, setNewMilestone] = useState(null);
  const [activeBonus, setActiveBonus] = useState(null);
  const [doneKind, setDoneKind] = useState("taiso");
  const [tab, setTab] = useState("core");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) {
          const raw = JSON.parse(res.value);
          const migrated = {};
          for (const [k, v] of Object.entries(raw)) {
            migrated[k] = v === true ? { t: true, b: [] } : v;
          }
          setRecords(migrated);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const streak = calcStreak(records);
  const totalDays = Object.values(records).filter((r) => r?.t).length;
  const nextMilestone = MILESTONES.find((m) => m > streak) ?? streak + 100;
  const todayRec = records[todayKey()];

  const save = async (next) => {
    setRecords(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("保存に失敗しました", e);
    }
  };

  const completeTaiso = async () => {
    const tk = todayKey();
    const already = !!records[tk]?.t;
    setAlreadyDoneToday(already);
    const next = { ...records, [tk]: { t: true, b: records[tk]?.b ?? [] } };
    const ns = calcStreak(next);
    setNewMilestone(!already && MILESTONES.includes(ns) ? ns : null);
    if (!already) await save(next);
    setDoneKind("taiso");
    setScreen("done");
  };

  const completeBonus = async (bonusId) => {
    const tk = todayKey();
    const cur = records[tk] ?? { t: false, b: [] };
    const next = { ...records, [tk]: { ...cur, b: [...new Set([...cur.b, bonusId])] } };
    await save(next);
    setDoneKind("bonus");
    setNewMilestone(null);
    setScreen("done");
  };

  const resetAll = async () => {
    if (!window.confirm("これまでの記録をすべて消しますか？")) return;
    setRecords({});
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({}));
    } catch (e) {}
  };

  // ---------- タイマー画面（連続コマ表示） ----------
  function TimerSession({ items, onFinish, onQuit, label }) {
    const total = items.reduce((s, m) => s + m.dur, 0);
    const [elapsed, setElapsed] = useState(0);
    const [paused, setPaused] = useState(false);
    const raf = useRef(null);
    const last = useRef(null);
    const prevIdx = useRef(0);
    const finished = useRef(false);
    const prevHalf = useRef(false);

    useEffect(() => {
      const tick = (t) => {
        if (last.current == null) last.current = t;
        const dt = (t - last.current) / 1000;
        last.current = t;
        if (!paused) setElapsed((e) => Math.min(e + dt, total));
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf.current);
    }, [paused]);

    let acc = 0, idx = 0, inMove = 0;
    for (let i = 0; i < items.length; i++) {
      if (elapsed < acc + items[i].dur) { idx = i; inMove = elapsed - acc; break; }
      acc += items[i].dur; idx = i; inMove = items[i].dur;
    }
    const mv = items[idx];

    useEffect(() => {
      if (idx !== prevIdx.current) { beep(880); prevIdx.current = idx; }
    }, [idx]);

    useEffect(() => {
      if (mv.switchAt) {
        const passed = inMove >= mv.switchAt;
        if (passed && !prevHalf.current) beep(660, 0.2);
        prevHalf.current = passed;
      }
    });

    useEffect(() => {
      if (elapsed >= total && !finished.current) {
        finished.current = true;
        beep(990, 0.3);
        onFinish();
      }
    }, [elapsed]);

    const remain = Math.ceil(mv.dur - inMove);
    return (
      <div className="flex flex-col items-center px-5 pt-5 pb-8 min-h-full">
        <div className="text-xs tracking-widest" style={{ color: C.inkSoft }}>
          {label}{items.length > 1 ? `　${idx + 1} / ${items.length}` : ""}
        </div>
        <div className="w-full max-w-sm mt-1">
          <SunBar progress={elapsed / total} />
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <div className="text-5xl font-bold tabular-nums" style={{ color: C.ink }}>{remain}</div>
          <div className="text-lg font-bold text-center leading-snug" style={{ color: C.ink }}>
            {mv.name}
            {mv.switchAt && inMove >= mv.switchAt && "（交代！）"}
          </div>
        </div>
        {/* 動きの連続コマ */}
        <div className="w-full max-w-sm mt-3 p-3 rounded-2xl" style={{ background: C.card }}>
          <PanelStrip panels={mv.panels} reps={mv.reps} />
        </div>
        <div className="text-xs mt-3 text-center max-w-xs leading-relaxed" style={{ color: C.inkSoft }}>
          💡 {mv.hint}
        </div>
        {idx < items.length - 1 && (
          <div className="text-xs mt-2" style={{ color: C.inkSoft }}>つぎ：{items[idx + 1].name}</div>
        )}
        <div className="flex gap-3 mt-auto pt-6 w-full max-w-xs">
          <button onClick={() => setPaused((p) => !p)} className="flex-1 py-3 rounded-full font-bold"
            style={{ background: C.card, color: C.ink }}>
            {paused ? "▶ 再開" : "⏸ 一時停止"}
          </button>
          <button onClick={onQuit} className="px-5 py-3 rounded-full text-sm" style={{ color: C.inkSoft }}>
            やめる
          </button>
        </div>
      </div>
    );
  }

  // ---------- トレーニングライブラリ ----------
  function BonusSelect() {
    const doneIds = todayRec?.b ?? [];
    const cat = LIBRARY.find((c) => c.id === tab);
    return (
      <div className="flex flex-col px-6 pt-8 pb-6 min-h-full">
        <button onClick={() => setScreen("home")} className="text-sm font-bold self-start" style={{ color: C.inkSoft }}>← もどる</button>
        <div className="flex items-end gap-3 mt-4">
          <Asahi size={60} mood="cheer" />
          <div className="flex-1 mb-1">
            <SpeechBubble>1〜2分ずつ、好きなのを選んでね。きみの週次メニューの種目だよ！</SpeechBubble>
          </div>
        </div>
        <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
          {LIBRARY.map((c) => (
            <button key={c.id} onClick={() => setTab(c.id)}
              className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap"
              style={{ background: tab === c.id ? C.sunDeep : C.card, color: tab === c.id ? "#fff" : C.ink }}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        <div className="text-xs mt-3" style={{ color: C.inkSoft }}>{cat.note}</div>
        <div className="mt-3 flex flex-col gap-3">
          {cat.items.map((b) => {
            const did = doneIds.includes(b.id);
            return (
              <button key={b.id}
                onClick={() => { setActiveBonus(b); setScreen("bonusSession"); }}
                className="flex items-center gap-3 p-3 rounded-2xl text-left active:scale-95"
                style={{ background: C.card, transition: "transform 0.1s", opacity: did ? 0.65 : 1 }}>
                <Thumb item={b} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm" style={{ color: C.ink }}>
                    {b.name} {did && "⭐"}
                  </div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: C.inkSoft }}>
                    {b.reps} ・ {b.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- 完了画面 ----------
  function Done() {
    const s = calcStreak(records);
    const bonusCount = todayRec?.b?.length ?? 0;
    const isBonus = doneKind === "bonus";
    return (
      <div className="flex flex-col items-center justify-center px-6 py-10 min-h-full text-center">
        <div style={{ animation: "rise 0.9s ease-out" }}>
          <Asahi size={120} mood={newMilestone ? "star" : "cheer"} />
        </div>
        <div className="text-2xl font-bold mt-4" style={{ color: C.ink }}>
          {newMilestone ? `${newMilestone}日達成！🎉`
            : isBonus ? "トレーニング完了！⭐"
            : alreadyDoneToday ? "今日も追加でえらい！"
            : "おはよう、完了！"}
        </div>
        <p className="mt-3 text-sm leading-relaxed max-w-xs" style={{ color: C.inkSoft }}>
          {newMilestone === 7 && "1週間つづいた！マップのキャンプ地🏕に到着。もう「たまにやる人」じゃないよ。"}
          {newMilestone === 30 && "1か月！お城🏯に到着。朝の体操が、あなたの一部になった。"}
          {newMilestone === 100 && "100日！王冠👑ゲット。これはもう、生き方。"}
          {!newMilestone && isBonus && "ラジオ体操の上に、さらに積んだ。今日のあなた、強い。"}
          {!newMilestone && !isBonus && (alreadyDoneToday
            ? "今日はすでに記録済み。カウントはそのままです。"
            : "起きてすぐ体を動かせた。今日はもう1勝してる。")}
        </p>
        <div className="mt-7 px-8 py-5 rounded-3xl flex items-center gap-6" style={{ background: C.card }}>
          <div>
            <div className="text-3xl font-bold" style={{ color: C.sunDeep }}>{s}</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>連続日数</div>
          </div>
          <div className="w-px h-10" style={{ background: "rgba(51,70,92,0.15)" }} />
          <div>
            <div className="text-3xl font-bold" style={{ color: C.ink }}>{totalDays}</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>合計日数</div>
          </div>
          {bonusCount > 0 && (
            <>
              <div className="w-px h-10" style={{ background: "rgba(51,70,92,0.15)" }} />
              <div>
                <div className="text-3xl font-bold" style={{ color: C.ink }}>{bonusCount}⭐</div>
                <div className="text-xs" style={{ color: C.inkSoft }}>今日のトレ</div>
              </div>
            </>
          )}
        </div>
        <button onClick={() => setScreen("bonusSelect")}
          className="mt-8 px-8 py-3 rounded-full font-bold text-white"
          style={{ background: C.sunDeep }}>
          {isBonus ? "もう1種目やる" : "＋1〜2分トレーニングする"}
        </button>
        <button onClick={() => setScreen("home")}
          className="mt-3 px-8 py-2 text-sm font-bold" style={{ color: C.inkSoft }}>
          ホームへ
        </button>
      </div>
    );
  }

  // ---------- ホーム ----------
  function Home() {
    const doneToday = !!todayRec?.t;
    const bonusToday = todayRec?.b?.length ?? 0;
    const toNext = nextMilestone - streak;
    const hour = new Date().getHours();
    const msg = doneToday
      ? bonusToday > 0
        ? "体操＋トレまで！今日のきみ、まぶしい…！"
        : "今日はもう完了！1〜2分のトレーニングもあるよ、どう？"
      : hour < 10
      ? "おはよう！起きてすぐのきみに会えてうれしい。3分だけ、いこう！"
      : "まだ間に合う！今日の1勝、いつでも待ってるよ。";
    return (
      <div className="flex flex-col px-6 pt-8 pb-6 min-h-full">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest" style={{ color: C.inkSoft }}>あさたいそう</div>
            <div className="text-2xl font-bold mt-1" style={{ color: C.ink }}>
              {new Date().getMonth() + 1}月{new Date().getDate()}日の朝
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full" style={{ background: C.card }}>
            <span className="font-bold text-lg" style={{ color: C.sunDeep }}>☀ {streak}</span>
            <span className="text-xs" style={{ color: C.inkSoft }}>日連続</span>
          </div>
        </div>

        <div className="flex items-end gap-3 mt-6">
          <Asahi size={72} mood={doneToday ? "cheer" : hour < 10 ? "smile" : "sleepy"} />
          <div className="flex-1 mb-1">
            <SpeechBubble>{msg}</SpeechBubble>
          </div>
        </div>

        <button onClick={() => setScreen("session")}
          className="mt-6 w-full py-7 rounded-3xl text-center shadow-sm active:scale-95"
          style={{
            background: doneToday ? C.card : `linear-gradient(135deg, ${C.sun}, ${C.sunDeep})`,
            color: doneToday ? C.ink : "#fff",
            transition: "transform 0.1s",
          }}>
          <div className="text-2xl font-bold">{doneToday ? "今日は完了 ✔" : "ラジオ体操をはじめる"}</div>
          <div className="text-sm mt-1" style={{ color: doneToday ? C.inkSoft : "rgba(255,255,255,0.85)" }}>
            {doneToday ? "もう一回やるのも自由" : "約3分・図解つき"}
          </div>
        </button>

        <div className="flex gap-3 mt-3">
          <button onClick={() => setScreen("bonusSelect")}
            className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95"
            style={{ background: C.card, color: C.ink, transition: "transform 0.1s" }}>
            ⭐ トレーニング（1〜2分）
          </button>
          <button onClick={() => setScreen("map")}
            className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95"
            style={{ background: C.card, color: C.ink, transition: "transform 0.1s" }}>
            🗺 冒険マップ
          </button>
        </div>

        {streak > 0 && (
          <div className="mt-4 text-center text-sm" style={{ color: C.inkSoft }}>
            あと <b style={{ color: C.sunDeep }}>{toNext}日</b> で{" "}
            {nextMilestone === 7 ? "キャンプ地🏕" : nextMilestone === 30 ? "お城🏯" : `${nextMilestone}日目👑`} に到着
          </div>
        )}

        <div className="mt-5 p-5 rounded-3xl" style={{ background: C.card }}>
          <div className="text-sm font-bold mb-3" style={{ color: C.ink }}>
            {new Date().getMonth() + 1}月のあゆみ
          </div>
          <Calendar records={records} />
        </div>

        <button onClick={resetAll} className="mt-auto pt-6 text-xs self-center"
          style={{ color: "rgba(122,140,160,0.6)" }}>
          記録をリセット
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex justify-center"
      style={{
        background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`,
        fontFamily: '"Hiragino Maru Gothic ProN", "Hiragino Sans", "Yu Gothic", sans-serif',
      }}>
      <style>{`
        @keyframes rise { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
      <div className="w-full max-w-md flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm" style={{ color: C.inkSoft }}>
            よみこみ中…
          </div>
        ) : screen === "session" ? (
          <TimerSession items={MOVEMENTS} label="ラジオ体操"
            onFinish={completeTaiso}
            onQuit={() => { if (window.confirm("今日の体操をやめますか？（記録されません）")) setScreen("home"); }} />
        ) : screen === "bonusSelect" ? (
          <BonusSelect />
        ) : screen === "bonusSession" && activeBonus ? (
          <TimerSession items={[activeBonus]} label="トレーニング"
            onFinish={() => completeBonus(activeBonus.id)}
            onQuit={() => setScreen("bonusSelect")} />
        ) : screen === "done" ? (
          <Done />
        ) : screen === "map" ? (
          <AdventureMap totalDays={totalDays} onBack={() => setScreen("home")} />
        ) : (
          <Home />
        )}
      </div>
    </div>
  );
}
