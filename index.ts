import * as web3 from '@solana/web3.js';
import * as sdk from '@hxronetwork/parimutuelsdk';

const privateKey = new Uint8Array([
	11, 45, 180, 78, 252, 117, 78, 232, 20, 16, 125, 43, 167, 149, 11, 240, 164,
	175, 246, 123, 109, 197, 86, 183, 22, 120, 246, 130, 67, 128, 120, 217, 44,
	179, 125, 30, 25, 197, 69, 69, 213, 31, 237, 115, 95, 134, 53, 214, 2, 245,
	192, 131, 14, 235, 160, 219, 49, 22, 17, 176, 210, 161, 186, 149,
]);
const keypair = web3.Keypair.fromSecretKey(privateKey)

const config = sdk.DEV_CONFIG;
const rpc =
	'https://devnet.helius-rpc.com/?api-key=6c8d6b2d-d450-40ae-8f14-06e093253afc';
const connection = new web3.Connection(rpc, 'confirmed');

const parimutuelWeb3 = new sdk.ParimutuelWeb3(config, connection);

const market = sdk.MarketPairEnum.BTCUSD;
const marketPubkeys = sdk.getMarketPubkeys(config, market);
const marketTerm = 60;
const selectedMarket = marketPubkeys.filter(
	(market) => market.duration === marketTerm
);

const usdcDec = 10;

const getData = async () => {
	const parimutuels = await parimutuelWeb3.getParimutuels(selectedMarket, 5);

	console.log(`\\nMarket Pair: BTCUSD\\nMarket Expiry Interval: 1 min\\n`);

	parimutuels.forEach((cont) => {
		const strike = cont.info.parimutuel.strike.toNumber() / usdcDec;
		const slotId = cont.info.parimutuel.slot.toNumber();
		const longSide =
			cont.info.parimutuel.activeLongPositions.toNumber() / usdcDec;
		const shortSide =
			cont.info.parimutuel.activeShortPositions.toNumber() / usdcDec;
		const expired = cont.info.parimutuel.expired;

		console.log(
			`${strike} ${slotId} ${longSide} ${shortSide} ${
				expired ? 'true' : 'false'
			}\n`
		);
	});
};

const placePosition = async () => {
  const parimutuels = await parimutuelWeb3.getParimutuels(selectedMarket);

  const pariContest = parimutuels.filter(
		(pari) =>
			pari.info.parimutuel.timeWindowStart.toNumber() > Date.now() &&
			pari.info.parimutuel.timeWindowStart.toNumber() <
				Date.now() + marketTerm * 1000
	);

  const contestPubkey = pariContest[0].pubkey;
  console.log('contestPubkey: ', contestPubkey);

  const txHash = await parimutuelWeb3.placePosition(
    keypair as web3.Keypair,
    contestPubkey,
    50000 * usdcDec,
    sdk.PositionSideEnum.LONG,
    Date.now()
  );

  console.log(txHash);
}


placePosition();