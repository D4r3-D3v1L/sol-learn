import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { it } from "mocha";
import { TweetSol } from "../target/types/tweet_sol";
import * as assert from "assert";

describe("tweet_sol", () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.TweetSol as Program<TweetSol>;

	it("Can send a tweet", async () => {
		const tweetKeypair = anchor.web3.Keypair.generate();

		await program.methods
			.sendTweet("First Topic", "First Content")
			.accounts({
				myTweet: tweetKeypair.publicKey,
				sender: program.provider.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([tweetKeypair])
			.rpc();
		const tweetAccount = await program.account.tweet.fetch(
			tweetKeypair.publicKey
		);

		assert.equal(
			tweetAccount.author.toBase58(),
			program.provider.publicKey.toBase58()
		);
		assert.equal("First Topic", tweetAccount.topic);
		assert.equal("First Content", tweetAccount.content);
		assert.ok(tweetAccount.timestamp);
	});

	it("fetch all tweets", async () => {
		const tweetAccounts = await program.account.tweet.all;
		console.log(tweetAccounts);
	});

	it("can filter tweets by author", async () => {
		const authorPubkey = program.provider.publicKey;
		const tweetAccounts = await program.account.tweet.all([
			{
				memcmp: {
					offset: 8,
					bytes: authorPubkey.toBase58(),
				},
			},
		]);
		console.log(tweetAccounts);
	});
});
