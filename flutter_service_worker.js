'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "027975ae79106b3150f050e262a09a94",
"index.html": "7f09e653f6d79e639bbd9e8e4c9b50a2",
"/": "7f09e653f6d79e639bbd9e8e4c9b50a2",
"CNAME": "21aa072b093c1c180186ac7381781fc1",
"main.dart.js": "cd2d2af42a239514fa69c715392789f9",
"flutter.js": "c71a09214cb6f5f8996a531350400a9a",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "643addeb7bdd18604d7f64dbf012292d",
".git/ORIG_HEAD": "b29a5293f5e3af5a1bd385515638ac2b",
".git/config": "07de461ed44a488efc8c3ef91b481e1a",
".git/objects/95/5baf3802b8fa5276764525a581a2cea499a6f0": "6a6100ec0d9db10d47caa4e2861ad470",
".git/objects/92/93b3f59720b3679dda0288f049353bc708fffe": "6dd5e41d9189141dc1294a522e1004d7",
".git/objects/0c/5384eed715cab8ba24a97f074e134bfd1e8782": "bf867c569c6054438b5553d5c5307fed",
".git/objects/66/1c0742c835fc0c39f3c48038fa45dd299e9e7c": "e89a6c3416c9a3bd5ab67099b47af795",
".git/objects/3e/99b46d120b2f86fbd934f4d83317859490bb8e": "09b16d9163fe2752649d03db385f5194",
".git/objects/50/dd2a88f6b7f5dd5fea05391a23fbf4821b1fa1": "2a945691fae9c29f6065d95ce5c9ca55",
".git/objects/68/02fdbc152cf4ad5649bce5ee540c328f843159": "b6a41fa5154a94bca285f2b9f54164e3",
".git/objects/3b/a48f09b5846c1fb961dc7286a2a7a6158b99ef": "0e546e6da8eca1aa59c55be7933adfda",
".git/objects/9e/b177ffa7dc3c3005e6b2f58fd1fb899963bc16": "45a029165a1260927798e0eb60598cec",
".git/objects/9e/f42a4634a345e959897e833bb244abc953655c": "f4a9777a26dbe5042275e926d59aec6f",
".git/objects/04/e5efc15dc0c60ea2ffcc37c5bf25e96689f44d": "978222f47488835b92838c74cb5c684c",
".git/objects/04/5eadeb670fd0802e5255400543c5332947f47f": "0bdfd6dcfaeff3fc10f18c83a57cebf8",
".git/objects/32/d40ae4a8f8d5e62e44b362043dd68d27330cbf": "ff6d36a72f171f1b758079e856b4f920",
".git/objects/69/a412b54b5e7399fa9ddca1d7695dda7b14a4e3": "d3d182c54071f4374142d034f2fb1e83",
".git/objects/69/2d07cf0e0d5263e3feefed1377313cd055e127": "cb88302012f74003d07cef924e25b8cc",
".git/objects/3c/230f666df426ca56cc4faa1a806f50239824cc": "488519eb51155b4223e3e4f370d26e97",
".git/objects/3c/552825e1112d4fb66cbc20536dd24d1125aef7": "64c5c560970a4a39bf1107658c7b5569",
".git/objects/56/791243335e8becf2a15a2188bf84a86b4b96bf": "334bf20f2bc13abe61399b10d15d8d54",
".git/objects/51/2d27f25653eb0969c6dbe34c38d59b9d5815d2": "a05b50f85d72fb89be45281943c5b695",
".git/objects/51/f48d90a530bc8c89834a4407e3fc677c9ed041": "6b52ae07469238cc0c6d72c322ecf776",
".git/objects/3d/ffcf8e33dd26684b3b8f633415d68a1c5d7ce4": "990411631f0b65ce4e2fae6bdbb941b6",
".git/objects/58/9da7c8b862f0338e85dbdf7b7e8a3a32df4aec": "92f44c82b149eb6714dbb06a18f2ead6",
".git/objects/58/3017eb02ab6abb9ee46be3b3c3bd64427e414a": "959192ff3a11136f75fc24a20c2f3986",
".git/objects/0b/34bcbd7eba5acd37bd5f95cb98ff7f99da5c3b": "f3393d938ef5b1ab5841f00cc5465c62",
".git/objects/0b/e06c6b6a2b42f7d46fd321f8ddbdc14b471171": "f508d09a0df837ba41a7a9c1e16c7cda",
".git/objects/93/1cb3db3456ce56ee5085c5c9623abbcce29d79": "d194c8f7e543d351561f2d8f0314feec",
".git/objects/94/3c46667d2df162b68f53fbafacacaa94aa313d": "c4a1f311f63474fe902d921004e200c3",
".git/objects/94/331a945b326864e404ec1344278c788223205c": "5b2d7aaeb0b07ae112f59210aaf1d7b1",
".git/objects/60/3af92c4da9a0821e530745f0ae0eb7495d2a64": "1560bf7057984b04efd61bbb051102f8",
".git/objects/34/41692cd0d2b7debc725252f14ee2ca0027d20c": "dfe1bfb7e0c4c60093666c7c3bcaf165",
".git/objects/5f/4749c6ce807c99ee04abe68fcd5481b3888572": "723e69a47f8c9d1a294a4d8e64fe7334",
".git/objects/9d/86c0c80b5ccf1c1e32aad44cc1caadb1919418": "d09a525321e20943289549e270e9243a",
".git/objects/9d/cccf4661d3bee59c4a4f383180049350babbf9": "a7012feaf8bcce49f45fcfe0867f605b",
".git/objects/9c/ec63c42ad3326994fcbecff37ddf42a0a057e9": "b3eeafc4dc5788f52f374ff9f4f8a17e",
".git/objects/02/d651fb952456c4c58685e23f72c40888180674": "0e7c50b1ce3548b00822bbc7a85901d0",
".git/objects/02/b27399d1703a4472f5ac7fa3d0e7be5f3213b2": "28ad5385c88f0a7757d5674bd29c37ed",
".git/objects/a4/5dd2db8e84785ed198e1907f7b0e9925b973cc": "e17240216244851e8287b1f0f47e3b70",
".git/objects/a3/a9e72d137718696e25eb9bee2642dc979dba97": "9c84912ed3624e9c5e4891df01d004c7",
".git/objects/b5/cb4f3f217b7b183a8a9be6e8528e80058d70ac": "99a002a9af67c1523f879d1a81e3b3c3",
".git/objects/ad/a87e5b0ba36974c3003400cd563ec799081111": "025484e49d4a99c498f528fdfeecdbaa",
".git/objects/ad/345415e52483300db575208a84c5546efb77be": "27aa1de7eb83c3876e256d6618620016",
".git/objects/bb/f078c17f38908eb91fac2c87cec7332f4cf65e": "a5b19e0856c8711cf2b3a222845ce04b",
".git/objects/d7/2c11112c7cb4e2ce754bc41470f9b829a2d00a": "d7280a766a5d6033f187d874a92b5ad6",
".git/objects/d0/ad22294c312758c3cc010b9830dbfc3f52ef0a": "fc1f0fb0b39003a2617f4ffbeca64927",
".git/objects/df/7d2dcb89ab89da87467c0e1059b38c8d8f9296": "a44162ff357b024e4638ab18a9bb01c7",
".git/objects/da/384d2d7f1dd300eeff8edafb09e943c5e5ab45": "d5a5923f9a9aa4591eaad8bbfe56b969",
".git/objects/da/f6b81b572e47521f4d42f2576cb0a80a24ab60": "06649ed12228ae298714ebe6ec6bc9d4",
".git/objects/da/94d05d28adcb62ae09b131e7387f3fa829d27e": "b098f85690224c32f5d65f87f95306a2",
".git/objects/a5/1bab16f4afd2be0c04453d882a1283e18611d5": "3bfcbb78b4ad34447561836596e723be",
".git/objects/bd/dc72f4c8c78163009dbb1e3695c893658cb2a5": "a7e1f7e55b8b64e5dc41023ff161a8fd",
".git/objects/d6/5c68a25c78ef9a8418c138ea5072c087281039": "76766ada015b17908fe500d5617de940",
".git/objects/d6/9c56691fbdb0b7efa65097c7cc1edac12a6d3e": "868ce37a3a78b0606713733248a2f579",
".git/objects/ae/b92484d81d5264d661744749b0d53d11e23227": "6915427b401842b0dd80670a8f512aa6",
".git/objects/f3/a1fda7542b2347c7182d777cf39c7cba92fae8": "7870b609d0209a26b6ae1a91309cd4c7",
".git/objects/f3/8be648ee511ae6b4c970c60cdc545d5c1b0523": "5d477708735ac26b61c784f8f3c855e7",
".git/objects/eb/9b4d76e525556d5d89141648c724331630325d": "37c0954235cbe27c4d93e74fe9a578ef",
".git/objects/eb/dfcb5c6258eae458403ede67b925f4a19e4968": "876b954b9035ff26900fc5320cae1ae9",
".git/objects/eb/34cc74465d88847dcf68bd9bff998a25f94cdc": "2da4c0ebb9544a88b74dc631afec080c",
".git/objects/eb/ea007e36c27a127dda6b5cb62a6b2ad2b3a4f0": "fbe1786112d5a47be405e439a1424aad",
".git/objects/c7/ec83612d8645c26da9be2fdf6e1861468cc98f": "3d4082d754022b924e877966a6f12eb1",
".git/objects/c0/e51bdd8bd4b0c225c20a34d37e204a6318dc58": "31b5c5d505ebcc585340e28192edc39d",
".git/objects/c9/03e84be60b3cdcb132002c83cf68c9ad8a4834": "68f431a62db890092c6a003d699daefd",
".git/objects/c9/37a6b984172559faa6c9ff2d9a09bd100f965f": "e1d7baf90d2f2abd204b9deb1d768f12",
".git/objects/fc/c52d847240673a6b89f76172eb20c8291e807b": "292d6215c71ca8824cf3be9facd4f98e",
".git/objects/fc/f82d225da03c787af01489324985e1781fff41": "6048218690bba9cfb77ab109a28a51d8",
".git/objects/fd/a881edcdc5745e9b77948e5c0e8bae417df0d0": "dae019e4f79e36dcbaa435de63bcc24d",
".git/objects/cf/78548557886562cde570044a6dc6c8f2c8bf72": "db8ca157ca84b2c5189a9b8a109bc3c1",
".git/objects/e4/1801924896c0c54d9f714ad7fdbd40b6d7059b": "bd13462d59f78f5e6a682431b3ffb38b",
".git/objects/e4/c283c369568c852328ec3541a80c2a1f092bed": "3bd6aebb42b264497cbc3071796bc042",
".git/objects/fe/250d5e593c341bb461bee6a64f7fe70c17a409": "b466eec89a4fd32c6c05817588541824",
".git/objects/fe/109d77f805aa4100423c05122e5f646d2ff96a": "e342a5ad24a4db6bab6b9de7eb609d09",
".git/objects/fe/81caacf71775ee1fca45ba6a06a2977e7d8d96": "23a151c0484512b7678da85152daa099",
".git/objects/fe/3e3a80a1ff756022d3302fb286219a8666dc1b": "0ff56c851af763b72d66414602f4b09c",
".git/objects/c8/c3dbb1f0670e1c72342038026c2c5c6b24152d": "c91f133375a4b149ad2e5a91e6e01bc9",
".git/objects/ed/481d0b71916f88be87f912752e08bb0585591d": "d4b673d76f638b3e165e9ac253616cde",
".git/objects/ec/7dd951bb5075907e1209fbdf53981a0093ab28": "15197a528a63d81366dedfc9c6afef12",
".git/objects/4e/9e671c29932b54b11428d1a8a3b5478e39d89d": "5f141376e9da4dcef5fcb1b2b00619f8",
".git/objects/20/1afe538261bd7f9a38bed0524669398070d046": "82a4d6c731c1d8cdc48bce3ab3c11172",
".git/objects/18/16c19eb5c0e49b2d47817a6bf9d3ac1edd2de1": "0dd99786526aece263323b0630a61525",
".git/objects/pack/pack-de73a53746d5e516178f2ce2251597a864a97ad4.pack": "a20abbe5c30cff42ff3f212bf420a2aa",
".git/objects/pack/pack-8d32bd22c010227755d38015ba71d60f580dbd3e.idx": "9bfaacdb53e3b3a7d3a1ebbfcced9967",
".git/objects/pack/pack-de73a53746d5e516178f2ce2251597a864a97ad4.idx": "a99af4b5c333b7b29ccbcf4328fbd44a",
".git/objects/pack/pack-9ffc940740a4bf57e93c71cb6ba88a4eb892b9a7.idx": "ae03cf458ae1b255020c5abda8ebd376",
".git/objects/pack/pack-466ad6bf3ec0bdb69a76cc05cd977e85a26a5f7f.idx": "bc8838b459c50124d8c6ec26a5a80c41",
".git/objects/pack/pack-9ffc940740a4bf57e93c71cb6ba88a4eb892b9a7.pack": "dce77c1ab52634eec3041ae371a580e8",
".git/objects/pack/pack-466ad6bf3ec0bdb69a76cc05cd977e85a26a5f7f.pack": "e13cd50ce07b7d5aad2343a773390d47",
".git/objects/pack/pack-700b92c6eb201a8aafa37d8e4c8e0a99b91e9885.pack": "e0d070bdd1de84450465d843352099bd",
".git/objects/pack/pack-700b92c6eb201a8aafa37d8e4c8e0a99b91e9885.idx": "4ba9c45626587a49b4e9a1cf4fc91ad9",
".git/objects/pack/pack-8d32bd22c010227755d38015ba71d60f580dbd3e.pack": "c524bf7358ab7668876a19fc74ceb2a5",
".git/objects/7d/c4702f59613d47f3fc851b2bbebaba4037d2fe": "a77dc5dce5316cdc9c521950c561cb7b",
".git/objects/7d/4471cc375a1152e5f01a1e69bae6ca22e48121": "7d5b97d5e67a2df2aea315f12048b0ff",
".git/objects/7d/48ae6071f484eaf11da9c885bd32a745cb96b0": "6f25093f87d96fbd70231e0cd627c93a",
".git/objects/29/bc1b1903612a7bfa4b0312fb49b42a7ecd2a24": "7f132b15c5856d9cb214a359dfa9e980",
".git/objects/7c/3ecc8a8c5445dd2df631ef665682c686329f66": "9285db46bd8fef05ded5c19e0d836146",
".git/objects/7c/6e77d5a075cf94a9b108b688b0c475c49ea6e1": "45d0f4ed53a9fb1c1debd13cf765d2f6",
".git/objects/42/31a4175d11e0c03ab156ef3de38d2a3beaf212": "aa022f0ebe6af0bceb993aae938bdc73",
".git/objects/42/1063ecde979390e58ad29d8f265d9a00a0b90d": "d02165135c7de1101f72beb2579769c2",
".git/objects/42/2d6a36ab1ba9b0040c11a37a1f9ca64f0d2611": "abf266e0856498f194c06e2bf88ae135",
".git/objects/89/2f2c5251dda3704cbcae5cc60a61df3a960921": "4a625e3298cd1d7a36cb7dbb44d20bf7",
".git/objects/89/a98443d201daa85d02ee0b34366a15f154ebdf": "90bc23d221476fd27a387d661122ddd9",
".git/objects/73/8db48bb96431df67983f2d78c4818e63cadd15": "92a2d39f9f2ed01a8f74f252d86dce82",
".git/objects/73/bf332c7a6a3aea7f6738ec26f2f01dec716fe6": "64a8e91e3316ef106a8a19a205d474f6",
".git/objects/74/04090ce7451f537b42a7037eff37ddf80b2ab5": "e910c26fb947f3275d3e396042d7a740",
".git/objects/1a/35416371a86565ff1903ae3c1dc51edbe20cae": "d209879a015bf8bf4bc10fa3e5e2543e",
".git/objects/17/a437e2352b0afd602e3494e3e981fa982ef02b": "1a598024de63a5ad7ca2598b42533216",
".git/objects/8f/ad2c7d12d820388eade0c426d10c269ad47263": "de77d01a7bebcc6e2c558b6d81a10dff",
".git/objects/8f/c7557b840ef207d1c21449839b60d43f590403": "7d859bb2768d70db56be71eda5a901b2",
".git/objects/8a/67ab476ce0a7303a783fadff53045162dede19": "9f7a8b7c75bdb994019736b73bf7f746",
".git/objects/8a/681abc0c2e22c739a42c9236409506bf36dabc": "4f7e7a4271fde27c605ab3f5411276e6",
".git/objects/8a/aa46ac1ae21512746f852a42ba87e4165dfdd1": "1d8820d345e38b30de033aa4b5a23e7b",
".git/objects/8a/d41123112dcc05e645c65693277074ac106233": "3de645de309caa9346a728f03e403fdd",
".git/objects/19/c51f653134e509446ffb4c0f7838e8eac80a24": "97078d8f9ba40b26d9399ae5ae5ba2fe",
".git/objects/4c/f06e230d2ad6625e317d404ba9d9da7d9f02a3": "edaf2fe3289eb6ae2e33e50d19f65785",
".git/objects/26/a7b9857adfa3748184ba04d5954fa6200a9e46": "0c138c65c9d29aee57c7f1cf0c663dad",
".git/objects/4d/5918366079effa05661471037e843cb4249457": "00cd0de5b7821dcd48a22b512dc6062a",
".git/objects/81/181492b98ac9b0669fbc4fbb2c217f8a9f2e38": "d2e11610630762b53fca241f3d42ce31",
".git/objects/81/a210af98ec21835cfc52b9a12f3e52ecb8becb": "70d49696237fdfa1c0419d3bbb376a92",
".git/objects/86/197815753e319007f634f11b31ee9ba362c7eb": "6ccee5608ab6ce1c90bd41d6a65ceb19",
".git/objects/44/8959c900113c1822a47be112d6895f57a93f6f": "20775c3f5256468f28de58d3f92ed59f",
".git/objects/44/ca5f5f0848a277cdacfdf161a6c4c43b1cd161": "369efe76f7ea4f94f4bf93d12736d83b",
".git/objects/88/cfd48dff1169879ba46840804b412fe02fefd6": "e42aaae6a4cbfbc9f6326f1fa9e3380c",
".git/objects/6b/360a395f4ecfded7273b1195b559163eb56fa6": "b709e768e611cb463f817c1f6c62c996",
".git/objects/38/b342f572ff3544fcfcef477166e6b2eb43a729": "8fd3552e047981fc2a908b12475607b6",
".git/objects/6e/88e941ac8576d2f9a406d92e577c4a0617c21f": "c689e50bac7521d9571718c42c542338",
".git/objects/9a/8b6d1d768688bf03a202727ff6d08f413c93f9": "6af440023618f1196a6b3accff5fefdd",
".git/objects/9a/6c8118c7d9f787dc9b434de98ae9b38943c17a": "61b220d8b662a9d62bf7be3d4f4c4501",
".git/objects/5d/85f52b03326a2307abc90688b4cf13f060ff5e": "1977c086be04df31eeee4adbe9202656",
".git/objects/31/001eedc05a25596b10684557abee5c10310b9a": "9907da68a8aa51bdb6020875f351b424",
".git/objects/91/3141b770b26941d9a993bfc207160dbe443612": "aff10c4e55627dc41e5a1d059c6ee56a",
".git/objects/91/12653d47428b1ec0062c6d5ac76e0e14e5fd75": "518d43f92e0b32007b5090ccd0418c2e",
".git/objects/91/1da411e4b098c6b864d9058fb04aa5397f74e9": "b9af532c8584ba2ca6da5d4014b77c9c",
".git/objects/65/6059822bdabf1d5986b137aa1ec3e64e35fb61": "0dd7a5cc28637f86bc98928d0a5c42bb",
".git/objects/96/91eda29b979896a303a0d65d409d851cbe31d8": "ca1b15b8202e404d13f5c3bcac8d881f",
".git/objects/54/d989f28751d457ed5fbd2c50593c851dc3fbcc": "d0bab6fc324e56cf01e2437f3409ac0e",
".git/objects/53/7807567919e88db2866b7825339c57e94c24d8": "970aec5149a3dbe9370a9dc982cdd022",
".git/objects/30/b87eb0d4ca3578a2688de38cde28d8f4b7ae90": "6bd1567f19d9ab3579fdd039a2bcaa31",
".git/objects/5b/74cd3865dcec8929925aaf46b7d462dd255ca3": "86f1d3b8a8ad9c8336e6be8550e3ebeb",
".git/objects/5b/3309a107b918c7e0474b969509ffc3541eff4a": "13040b1a3deec03eecd8e4b3faa18703",
".git/objects/5b/59a961a3069fdbaff68844a57feda606206818": "d049d5f800546074afe5a26044d903bd",
".git/objects/5b/90a9cdbbee72e1b80b0307035f58340972faa7": "e3c5fe7db559f60e4a9617b1a53f17a6",
".git/objects/6d/6e308baa9e0207b76b90c0b9130a7d2019d64e": "902c1c9b6f25f9298ef6efd308cae01b",
".git/objects/6d/6ba5ad84032f5640133e224a25172d061bca62": "3f22f9607d0bc99f9248a67e7a2562c9",
".git/objects/6d/8621f8e1458d4c5793923a9c70f4626cdded4a": "8485a6814b95a89aa3cc7a12d6196bbe",
".git/objects/01/182dd4d76284c11ae48154bf307581d0f6b75d": "f41f924177e2e95b81022cbb7e381645",
".git/objects/01/6d52bf02f42033314765cf31843d18b3dc28f8": "c2a790647f747afbc63eb08b28dfa75b",
".git/objects/06/e99c39d026bf74887c8db8e7c3899443e87142": "079e78c3710055c53e68e0b53e16c472",
".git/objects/6c/851ce92d29ae9f51c91a7efed1f381e4940185": "21d14befc3ed7157b29c7b9d4c41e848",
".git/objects/39/82513d7806e72ace5edfddd05ed54557db256f": "47d3d03ffe2e24e8144ac8b716cd6a0f",
".git/objects/52/26398ce49bad1f9041ca5d9c8bb6011f148ecc": "712ce5cc8753f51e7fcf474a9b84bcd2",
".git/objects/55/ccc1c4af6f1ae5412adba440113beaa8d764c2": "e5c52c954bcb665b2d678f50b066179a",
".git/objects/97/52375e36a28172ba2bcbb726144c9523b0df49": "5ee26111f3d1fa9b43638b55dfe3cc82",
".git/objects/63/b7271c971a87ac1b69bbd49257c8e20271780f": "acfac9ab98c1e0adc9024b4c447943e0",
".git/objects/63/fe3882dacd94cdd01c5a970458972f4ac9a172": "78345d689dfee1382c2d3a1be2077710",
".git/objects/0f/23e96097bac281c0fb60b7cd84d8e205479e28": "4eb9b0a7dfdc031b3db10f15dc04bdfd",
".git/objects/64/418b872feb08a786fb5c66c16a0cb6807300fe": "05746866e2d1fdcd5c0abc89dd84f30e",
".git/objects/bf/14f35ec565c4b7dd97805a8fa1cabb993f9435": "53c475f9d6a471527de35471082dcc61",
".git/objects/bf/244d05900f438f21336444b89b630fadc9b947": "1790240059e33b1335a036cf1925fc07",
".git/objects/d3/eca6ad39e569ee40d19f662ce1229bb010ec93": "feb8f007fe165f5b997feaa7b3a9baa7",
".git/objects/d3/e0982e84d5f467ccf0a3ae5276604166abbe6d": "698288a787aa76ef2b50ee354ef3714c",
".git/objects/d4/4bf5bc3deb24e3bd83edf66c1c54d2ffb180aa": "a05949821726793bca89987d594499d6",
".git/objects/ba/8cb00dd5231f1a55de0205c16445926a696526": "be8592f9341c9b01b70890c8614c6cf7",
".git/objects/ba/2106e30c96b16bfaf83843d4b45516ecf1dbe0": "9523abfa01fe85d2037063f1deb7a50d",
".git/objects/ba/558c735f46c9d1671f326054aa5b6297ca626d": "97ff1693848b4ab3d0fd0ae1628025cf",
".git/objects/a0/e744659b688e11a0b8c1d2906f5f9e499695bb": "1e6b48f31b132a26f57ced2b88d644a3",
".git/objects/a7/9498df822901ae4c4c7a26aef622d7d873b8ca": "8ac627e1c16d9ee1eb93e9906969dc4c",
".git/objects/dc/d6378304fdd2e717054979748f0e57936d7df8": "d1991ff720d7ce86932b76c19b527041",
".git/objects/dc/0b12d7e7a1f5e0ccc4faa1cf1c5554c0732066": "5a794a66297f9c1eb66b7123ea89c149",
".git/objects/b6/566308b5ad8ae4cbfd21f9838b70fdc4a6cc22": "a3bd5325351a7271874b9d2109b58057",
".git/objects/a9/c6572674a52932e96a947bdfd800547c60d32f": "a5372c1d5967e3a4e37e9caa424c037f",
".git/objects/d5/6327758d254e29f63c9eba0d4a8ed135532008": "7e1b5c5b8998e57e566046ca851cee8b",
".git/objects/d2/ffe50371819c058f98abc69aa009c34b698582": "b298b8ecb40727f9d2bf319b4e5d2d70",
".git/objects/aa/91974429fa3e9a242b9d8ba639491594d20480": "b6de3dbe9d8f664eb070dca0ed1ec10f",
".git/objects/af/4ed7a3d0d3264b1112ce9cfca75070c5d635da": "b7a814da5330d573262f0e9473556e70",
".git/objects/b7/49bfef07473333cf1dd31e9eed89862a5d52aa": "36b4020dca303986cad10924774fb5dc",
".git/objects/b7/f09121abaf313591302f068e6dc831369bf32f": "c65c29dc4305a8bcfe7ade936d091230",
".git/objects/a8/fcce83b11b7c4fd62df33f674e0fe944429aa1": "9bba1dada26a902bc8da5ca30b5d089c",
".git/objects/a8/62cc0b759003a5b4358b09b94ce74c625d9cbf": "e1bc4dbb9a22b63ecd1af27d0f641600",
".git/objects/de/e40b8713b47b0ba97e177719ae5c9629899a80": "79953775c5a61687f1d473fde8a0233a",
".git/objects/de/88dc2ee01a2a782ae10a81cbb884c2a79d3f71": "02737228b08e70da423cf587fce28b34",
".git/objects/b0/75b8e8291b62501bc6556cfcd3932e5826fcae": "05e6c3150b7a6030ab00c76e9955649d",
".git/objects/b9/2a0d854da9a8f73216c4a0ef07a0f0a44e4373": "f62d1eb7f51165e2a6d2ef1921f976f3",
".git/objects/b9/37610a9ec1f18170433b072a04fccbd0f7374b": "4d29de1f362c7e07ac769ae3ea44b7e0",
".git/objects/ef/7a5a3da81b6cde3527a388cf8fbfcb38a30b1b": "f29212b090524ec5980c93bdafad97e5",
".git/objects/c3/e1fb379cdc23729bc8b260238bda569c40d830": "ac43b83364358f4a7d1c5a66e407d1fd",
".git/objects/c4/e4c0b6a941c9b44ea32492684964c20d44c964": "31f93fd16ddce823e64107b6c348427e",
".git/objects/ea/b0ceafdf5623fd0acbf93c7f3d2a31a5b019c3": "0d9f3ca21d8df263de8e1009f1b645a7",
".git/objects/cd/36b2c629045f950b64bf4280740015f20d8b90": "26133f8f701ab59d4a215c1735c7db27",
".git/objects/cc/76cf8738bb4e952e67847d1e065baef3cdddb5": "3361fa7e0bca5321e526863e4eb4606a",
".git/objects/e6/b745f90f2a4d1ee873fc396496c110db8ff0f3": "2933b2b2ca80c66b96cf80cd73d4cd16",
".git/objects/e6/74c0166a34d94bff4e7ab0366f340b1449cb49": "a5c3e74ab1abd130341b4ec61b736bb9",
".git/objects/f9/2b090f64246adc97132eab42425c64df91fdba": "83c6ccb59072507d04ab3e77b0b076ff",
".git/objects/f9/d32ea35781fc63a32d09cdbe4671cdbc1b9856": "c4d784bca2ba6c9bb0baf8f0ee7cb47a",
".git/objects/e8/2c5850db3a3482d0c954a4dc122c02de555ce7": "d357cd906b3805bf81477f5527cca086",
".git/objects/fa/24fd1b8901c1f3630d0f066aaf28b6d4831e3c": "7ace0b7fc817c1f033d7e96825e9c3cc",
".git/objects/fa/1f3cafc52ff5b5c4872d10b03555b54fd66701": "7e124dd59369ac54507e35637bd4e3ff",
".git/objects/fa/81d0cc454e3cb76ad2b16e97d09d6e390c48ba": "9190dbcf22d3f0b88a877e19fbdd02ae",
".git/objects/c5/5773e22c57dffa87f5e58e44b3ed63647f8db8": "766cf692821f9df0727800899e346b41",
".git/objects/c5/f4bc2a4da91586f3005813077f0d0aa9040f82": "3191028b787554cee4652f5050144bff",
".git/objects/c5/36a381a3695fe12faa5b23b941cd37dbb9e308": "a2e7c5083c51f8aa4e7d11af74d40f48",
".git/objects/f1/10902661cdc159b6bec59ed07d4be21f18750b": "e185db1152fe3497affde8715e0faa98",
".git/objects/cb/1da218a355fcd20d909ece147afb0a25fb89f1": "967b319ca387253e7b7ef4aad8fbb652",
".git/objects/ce/ad936ce503500c90e33486b9a079b66bf5b2e8": "e2b58ae9e7133c7b729e0b6b302cca02",
".git/objects/46/3f239b4114dbc055867a1a13662c329cfd77cb": "22dc760b3157f6612ad84957c6d65527",
".git/objects/46/4ab5882a2234c39b1a4dbad5feba0954478155": "2e52a767dc04391de7b4d0beb32e7fc4",
".git/objects/2c/730c873649c727e94ba6c259c9b2a628a36aca": "06f175d754ec85497888511076d24b04",
".git/objects/79/7aa240b2c4d317f6c13dd84668e2bd09b60bbf": "1c7fc9ac2ce5499d27c15b3642f0f66a",
".git/objects/79/b61807d8643a2d2067b0b246697dd81b7e9f9d": "5de4da8f1a127fd4ee980fca3ac25777",
".git/objects/1b/b585d32db78ccb9358ba7cd3f7c7f167191776": "92b8924952a908041dc3976f900ebc42",
".git/objects/77/3f7e9c38bcf25290caa2a0db47675437970779": "4cd96fdb49798675720a490a7a7d4a2e",
".git/objects/77/ff67bb090c131cd9aae1ae4565f6fb0623a4b4": "62a020a2493335e40d985490f0a322e8",
".git/objects/77/3a4c7734efd55ad97309020b7b8f074945bb3b": "40f963d3ad7e0b2959b93ee45fd4c33d",
".git/objects/48/d6a32e00c9a282fd2e2a9f68193d01bfee9c0e": "5051843a694802be62d351b34e120941",
".git/objects/48/9d87c3cedcddc0ef62c861fe47a49d0a9b6630": "015e758b6323c85b1a37613e77750f8f",
".git/objects/1e/b30b21a047c6e178f426c45166b1f0a414413c": "b6e8cd176526ef233e4c77d578fe14fa",
".git/objects/4a/e3d3bcbab9443fa0fd5ede7f167efdea6471a3": "3ed369b1424cde8200d0a849a7a7e6ee",
".git/objects/4a/39079e580dc9be820cba2fae41238c49eaa798": "ada1a19fea32fbb6719120809b9eae60",
".git/objects/4f/c24218bb2217ef632adfbc541f1c27677307fa": "aad0ed024fe30c4030474c7e00b87e11",
".git/objects/8d/245266d25708fc91151ef1f140c0944cba2c5f": "5a3fd656f9a1d55df9074bc3ccc9c8e8",
".git/objects/71/7117947090611c3967f8681ab1ac0f79bca7fc": "ad4e74c0da46020e04043b5cf7f91098",
".git/objects/1c/42eb0ceb4e50e347e3c2565bbbc796396edf19": "324c366386ca3cf0a36cedd25b402161",
".git/objects/82/b25628056ae747fafd21f389b69665a115b67f": "9137004f7e611244a7f755cce159b59e",
".git/objects/49/3a295ddee07f27fac10766546a8cf8b59a79d8": "a79c6f1017f5ecc60bd25838ccd42650",
".git/objects/2e/9d7ec566f96c3bfbbb0518d350dcdb0d3796ba": "ac6c8cbd84f82cd43a2ca1a55c47eba6",
".git/objects/2e/0d275d3e7a274c8450536e33f64acba6025e54": "9085c0888008c9a6ba23e087b291c339",
".git/objects/2e/60dd6c47d2afa6ba870fa0f67b82d8cdb3bee0": "e39bb361bf75b21c4dff0237bcbe26bf",
".git/objects/8b/5e169c54ee5a41e12f795f1823038bd0b65ccb": "67eb47024abd8b36cdf714237a0cdde4",
".git/objects/14/1e74ee227d746d6bae7f7304b0f94035f0e8ad": "10d78e4c697fbcb498a4c174326c572f",
".git/objects/22/e1cfe83376011cad0f492c0c18c8788b3a2db3": "658a582bea7d1ee0d114c0bcc3d6e64c",
".git/HEAD": "cf7dd3ce51958c5f13fece957cc417fb",
".git/info/exclude": "036208b4a1ab4a235d75c181e685e5a3",
".git/logs/HEAD": "8b63cba6ac3905d3ce7f86dead4a2f9e",
".git/logs/refs/heads/main": "13bd361fdeda7b49aa7ce9cd92b0c349",
".git/logs/refs/remotes/origin/main": "ae6a043a57bc59f8f1febe459c39a2f8",
".git/description": "a0a7c3fff21f2aea3cfa1d0316dd816c",
".git/hooks/commit-msg.sample": "579a3c1e12a1e74a98169175fb913012",
".git/hooks/pre-rebase.sample": "dc9319712df96e4b8b7d80aaf6a89a3a",
".git/hooks/pre-commit.sample": "305eadbbcd6f6d2567e033ad12aabbc4",
".git/hooks/applypatch-msg.sample": "ce562e08d8098926a3862fc6e7905199",
".git/hooks/fsmonitor-watchman.sample": "a0b2633a2c8e97501610bd3f73da66fc",
".git/hooks/pre-receive.sample": "2ad18ec82c20af7b5926ed9cea6aeedd",
".git/hooks/prepare-commit-msg.sample": "bff22a56cae99e478ac195d3729ac799",
".git/hooks/post-update.sample": "2b7ea5cee3c49ff53d41e00785eb974c",
".git/hooks/pre-merge-commit.sample": "39cb268e2a85d436b9eb6f47614c3cbc",
".git/hooks/pre-applypatch.sample": "054f9ffb8bfe04a599751cc757226dda",
".git/hooks/pre-push.sample": "2c642152299a94e05ea26eae11993b13",
".git/hooks/update.sample": "647ae13c682f7827c22f5fc08a03674e",
".git/hooks/push-to-checkout.sample": "c7ab00c7784efeadad3ae9b228d4b4db",
".git/refs/heads/main": "6bf721083cb78846c28905215c39e52c",
".git/refs/remotes/origin/main": "0afc74749b54d370645288bfed00e3cd",
".git/index": "27408f64cba901cef6cebcb766bf6f31",
".git/packed-refs": "a891e6bb26eb0d480aef486a7e8ea166",
".git/COMMIT_EDITMSG": "a8297d555dd34879e8e48e1cf12acefa",
".git/FETCH_HEAD": "425ee3ef30dac667b34f7b0e2bee78ba",
"assets/AssetManifest.json": "3f0d0466cf97e469d3172a9368e79102",
"assets/NOTICES": "dd3ca994d490931b390602e96525d358",
"assets/FontManifest.json": "93e8f9c1bb4302cd78172f5d2b9cfe3d",
"assets/AssetManifest.bin.json": "628c7a1e500371feb1165064f8fdc0c0",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/AssetManifest.bin": "1abc87304d99b2a87ae0ecac78e0a634",
"assets/fonts/MaterialIcons-Regular.otf": "b86f44e1cdf8e417e33316f9998f6854",
"assets/assets/won.jpeg": "4e105013fb0527698ce2abbfc392df87",
"assets/assets/git.png": "18cbe5e4d1700db0fe010052481a0b42",
"assets/assets/code.json": "921678c104b23e30b0feba2f9741aae2",
"assets/assets/projects/img22.png": "236cb97c20e871f4e25ad73bc983241a",
"assets/assets/projects/img_10.png": "16762debad75a0226d964d3caa1a14d8",
"assets/assets/projects/img_1.png": "f88de045011348c5d26692ce0680bbac",
"assets/assets/projects/img_0.png": "9da5e77df7f2b1d9b1d5f586fdb689b2",
"assets/assets/projects/img_11.png": "bfc3dc2b437fd7ca1e4872646e9da4a3",
"assets/assets/projects/img23.png": "8c4163beaf5eb688174210a9881b9847",
"assets/assets/projects/img21.png": "1228446bda7bad5aef6ef110138ccf3d",
"assets/assets/projects/img_13.png": "2be648a7bdf962756245449482bbc910",
"assets/assets/projects/img_2.png": "c51bf86dd744c951a5be51fa1c68a2de",
"assets/assets/projects/img_3.png": "e3c411f2baf67a06317db7aabfbb3e8c",
"assets/assets/projects/img_12.png": "437f0b68bf53e05ae8a378f3d0dd6f07",
"assets/assets/projects/img34.png": "40f634572d27f2fc789d5d1ea2d68877",
"assets/assets/projects/img20.png": "8ded1c8a0ff9deed7c1cd4ce36706c1e",
"assets/assets/projects/img24.png": "da3e91c8cd73aa01b2349b7a290d675e",
"assets/assets/projects/img30.png": "054f7cce993ea0ed6ab948b7c0269b1a",
"assets/assets/projects/img18.png": "87ffc7215dee311b92e1eab1b4ffcac1",
"assets/assets/projects/img_16.png": "3e2239f0a2b7f44998e5f2c6295dfba7",
"assets/assets/projects/img_7.png": "2d6d410f04e964751210451e9e93622f",
"assets/assets/projects/img_6.png": "c6cf20c9468c8c446fd8c0b6f32bffbd",
"assets/assets/projects/img_17.png": "807fc6786f577a07c55d13051a9102b9",
"assets/assets/projects/img19.png": "e7fe9a3b3beebce33cb7ef0e81a0b7db",
"assets/assets/projects/img31.png": "5bd2edb55a17aa4742db3fc8295d5c41",
"assets/assets/projects/img25.png": "5a669222c4c41ca20a6e0844ee0463ee",
"assets/assets/projects/img33.png": "a2e5b03a0abd4535c544ed26411b0dfa",
"assets/assets/projects/img27.png": "37ae19a616fe45993c0d1692e4df9d01",
"assets/assets/projects/img_15.png": "8a013249503657eba4896d6941fa8ec7",
"assets/assets/projects/img_5.png": "aafb0b89d9feeb0455b4f01c758c2074",
"assets/assets/projects/img_14.png": "f125e99cf330c663a346e089fe3839d9",
"assets/assets/projects/img26.png": "3b251ec50984f5bd6ae6c2b88c844fb7",
"assets/assets/projects/img32.png": "8bbdec0db035472ddc87a60e36fb9832",
"assets/assets/projects/img9.png": "3b87e209542c82d6c0d66ee7164ec1a1",
"assets/assets/projects/img8.png": "d996f9e5452dd5ee6db66b5e7955811f",
"assets/assets/projects/logo0.png": "49eaa00e668c7fe2d484eb19088e930b",
"assets/assets/projects/img5.png": "da20c8b87254e2cea7be765d3b531e2b",
"assets/assets/projects/img4.png": "149edbf4b6fde5ab3115f4517cc8919e",
"assets/assets/projects/logo1.png": "9030a2ab6570d379928902c8d09cdc49",
"assets/assets/projects/logo3.png": "9c74e715a36a0bc5b49247814297d178",
"assets/assets/projects/img6.png": "195591a7f94017e06bc9237f99d3fd07",
"assets/assets/projects/img7.png": "cd5cb61301ba7cb42b39f94e842393b6",
"assets/assets/projects/logo2.jpeg": "b38aefbd0026af1f4df1719e44c9f077",
"assets/assets/projects/logo2.png": "15d5b1ffbd7525c82da6037b0271c11d",
"assets/assets/projects/img3.png": "e8749f504cc6b5ef5a38008f08156915",
"assets/assets/projects/img2.png": "0fbf0de74f4ba8e133178c057d77702c",
"assets/assets/projects/insta0.png": "78bda9045edafc9d26284591c29252dc",
"assets/assets/projects/img1.png": "0344d10a26739b3f23593726a8fa6d3d",
"assets/assets/projects/logo4.png": "0fb768831cb859f905552470d51f7d49",
"assets/assets/projects/img17.png": "226082cc59c7a6f3571c647df20cd98f",
"assets/assets/projects/img_19.png": "5e59a533eb2c7836ffe176de74f722d4",
"assets/assets/projects/img_8.png": "10807689d61b91d6def215477a9800d7",
"assets/assets/projects/img_9.png": "f927c8873b61e60e540e85807dffb3ca",
"assets/assets/projects/img_18.png": "f5321a5b3579491d179a741111e508b1",
"assets/assets/projects/img16.png": "44f6c61e65a887acc639a298650b4b77",
"assets/assets/projects/img28.png": "659b2ba7f61475e665ce3b27fdef0cda",
"assets/assets/projects/img14.png": "0f49fe13587a7770e3d65ba8fbca69aa",
"assets/assets/projects/img15.png": "8a8dddd38cd18072ee10131a860f2fc5",
"assets/assets/projects/img29.png": "3c42b9de124ec8e7ac3f23e52bbf1752",
"assets/assets/projects/img11.png": "052cb24197dccf209a2966dad3ba3171",
"assets/assets/projects/poster0.jpg": "f0644d19b198db762cc0094a6517accd",
"assets/assets/projects/img_22.png": "e41f34b4a0fe51233938d82de870551e",
"assets/assets/projects/img10.png": "ddb39948c84fe4c8b2491545dcaa011b",
"assets/assets/projects/img12.png": "3b7efaf85af0d76cd447d36d866c43f4",
"assets/assets/projects/img_20.png": "ee951823ad2f43b4d6e3a61bd5000525",
"assets/assets/projects/img_21.png": "1233a7eed0bb97cfeb733d54f1108d31",
"assets/assets/projects/img13.png": "871068d9b79648ff70b339dc418a4183",
"assets/assets/background.jpeg": "1c5baadefcd73ee3f976c184d845cf2c",
"assets/assets/background.mp4": "00acdc59b1f4cbcfc3077b6a352d3f7d",
"assets/assets/phone.png": "e81371d734cea828d2522ff973a0e358",
"assets/assets/font/NeoDunggeunmoPro-Regular.ttf": "116c77711228c021d2e472cda0fd763f",
"canvaskit/skwasm.js": "445e9e400085faead4493be2224d95aa",
"canvaskit/skwasm.js.symbols": "ddbbc645fa24f351cee22798670fa292",
"canvaskit/canvaskit.js.symbols": "f4ad084190a9b973a7d6a6c24dfe70f2",
"canvaskit/skwasm.wasm": "22ddda77fde9820164b22d160ed991d6",
"canvaskit/chromium/canvaskit.js.symbols": "d6ef624e9af76e20b65b95ceb2e4d6b1",
"canvaskit/chromium/canvaskit.js": "43787ac5098c648979c27c13c6f804c3",
"canvaskit/chromium/canvaskit.wasm": "82d3269749db25356b372617f9a09faf",
"canvaskit/canvaskit.js": "c86fbd9e7b17accae76e5ad116583dc4",
"canvaskit/canvaskit.wasm": "d4a43e5f076a0d38ff6ab8b73bf36677",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
