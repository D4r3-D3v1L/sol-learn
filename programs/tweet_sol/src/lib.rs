use anchor_lang::prelude::*;

declare_id!("7AUJ9r93pB1mAXDvWDZ5YmgJqJW9aoCrjUXsne6KuvTP");

#[program]
pub mod tweet_sol {
    use super::*;

    pub fn send_tweet(ctx: Context<CreateTweet> , topic: String , content: String) -> Result<()> {


		if topic.chars().count() > 50 {
			return err!(TweetErrors::TopicTooLong);
		}
		
		if content.chars().count() > 280 {
			return err!(TweetErrors::ContentTooLong);
		}

		let my_tweet = &mut ctx.accounts.my_tweet;
		let sender = &ctx.accounts.sender;
		let clock = Clock::get().unwrap();

		my_tweet.author = *sender.key;
		my_tweet.topic = topic;
		my_tweet.content = content;
		my_tweet.timestamp = clock.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateTweet<'info> {
	#[account(init,payer = sender , space = 1372)]
	pub my_tweet : Account<'info,Tweet>,
	#[account(mut)]
	pub sender : Signer<'info>,
	pub system_program : Program<'info,System> 
}

#[account]
pub struct Tweet {
	pub author: Pubkey,
	pub timestamp: i64,
	pub topic: String,
	pub content: String,
}

#[error_code]
pub enum TweetErrors {
	#[msg("Topic Should be Less than 50 chars")]
	TopicTooLong,
	#[msg("Content Should be Less than 50 chars")]
	ContentTooLong,
}