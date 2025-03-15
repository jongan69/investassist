import Link from "next/link";

const LEARNING_CONTENT = [
  {
    title: "Introduction to Investing",
    description: "Learn the basics of investing and the different types of investments available.",
    content: "Investing is the process of allocating money with the expectation of generating a profit. There are many different types of investments, including stocks, bonds, cryptocurrencies, and real estate. Each type of investment has its own risks and rewards, and it's important to understand the pros and cons of each before making an investment decision."
  },
  {
    title: "Types of Investments",
    description: "Learn about the different types of investments available and their characteristics.",
    content: "Stocks are shares of ownership in a company. Bonds are loans made to a company or government. Cryptocurrencies are digital currencies that use cryptography to secure and verify transactions. Real estate is property that includes land, buildings, and other improvements."
  }
]

const USEFUL_LINKS = [
  {
    title: "Moonshot",
    description: "Moonshot is a platform that allows you to invest in Solana cryptocurrencies.",
    url: "https://moonshot.money?ref=vtsmoh24uf"
  },
  {
    title: "Axiom",
    description: "Axiom is a platform that allows you to trade cryptocurrencies.",
    url: "https://axiom.trade/@jongan69"
  },
  {
    title: "AssetDash",
    description: "AssetDash is a platform that allows you to track your portfolio.",
    url: "https://bit.ly/3dNXbSJ"
  },
  {
    title: "Vector",
    description: "Vector is a platform that allows you to trade meme coins with friends.",
    url: "https://vec.fun/ref/jongan69"
  },
  {
    title: "Wealthfront",
    description: "Wealthfront is a platform that allows you to automate your investments.",
    url: "https://www.wealthfront.com/c/affiliates/invited/AFFA-XM0N-KTWR-LI4O"
  },
  {
    title: "Ourbit",
    description: "Ourbit is a trading platform that allows you to trade cryptocurrencies on multiple chains.",
    url: "https://www.ourbit.com/register?inviteCode=retardio"
  },
  {
    title: "Bags",
    description: "Bags is a platform that allows you to buy and sell solana memecoins with friends.",
    url: "https://bags.fm/$JONGAN69"
  },
  {
    title: "Groundfloor",
    description: "Groundfloor is a platform that allows you to invest in real estate.",
    url: "https://app.groundfloor.us/r/o6d7b4"
  },
  {
    title: "Webull",
    description: "Webull is a platform that allows you to trade stocks, options, and cryptocurrencies.",
    url: "https://a.webull.com/3DbzDujWx1zNAkk2CZ"
  },
  {
    title: "BonkBot",
    description: "BonkBot is a telegram bot that allows you to snipe meme coins.",
    url: "https://t.me/bonkbot_bot?start=ref_jyzn2"
  },
  {
    title: "Public",
    description: "Public is an investing platform where you can invest in stocks, bonds, options, crypto, and more.",
    url: "https://share.public.com/jonngan"
  },
  {
    title: "Fundrise",
    description: "Fundrise offers world-class private market investments like real estate, private credit, and venture.",
    url: "https://fundrise.com/i/g70dlo?utm_source=fundrise&utm_campaign=ios_share"
  }
]

export default async function LearnPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Investment Learning Hub</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Getting Started with Investing</h2>
        <div className="prose dark:prose-invert">
          <p className="dark:text-gray-300">
            {LEARNING_CONTENT[0].content}
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recommended Platforms for Beginners:</h3>
            <div className="space-y-2">
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Wealthfront")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wealthfront - Automated Investment Management →
              </Link>
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Public")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Public - All-in-One Investment Platform →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Investment Categories</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Stocks & Options</h3>
            <p className="dark:text-gray-300 mb-4">
              Start your journey in stock market investing with user-friendly platforms.
            </p>
            <div className="space-y-2">
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Webull")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Webull - Advanced Stock & Options Trading →
              </Link>
            </div>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Traditional Cryptocurrency</h3>
            <p className="dark:text-gray-300 mb-4">
              Explore the world of digital assets and cryptocurrency trading.
            </p>
            <div className="space-y-2">
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Axiom")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Axiom - Advanced Crypto Trading →
              </Link>
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Ourbit")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ourbit - Multi-Chain Trading →
              </Link>
            </div>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Real Estate Investments</h3>
            <p className="dark:text-gray-300 mb-4">
              Invest in real estate properties with lower barriers to entry.
            </p>
            <div className="space-y-2">
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Groundfloor")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Groundfloor - Real Estate Investment Platform →
              </Link>
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Fundrise")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fundrise - Private Market Real Estate →
              </Link>
            </div>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Portfolio Tracking</h3>
            <p className="dark:text-gray-300 mb-4">
              Keep track of all your investments in one place.
            </p>
            <Link
              href={USEFUL_LINKS.find(link => link.title === "AssetDash")?.url || "#"}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              AssetDash - Comprehensive Portfolio Tracker →
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Meme Coins & Social Trading</h2>
        <p className="dark:text-gray-300 mb-4">
          Explore the exciting world of meme coins and social trading platforms. Note: These investments are typically highly volatile and risky.
        </p>
        <div className="grid gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Solana Ecosystem</h3>
            <div className="space-y-2">
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Moonshot")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Moonshot - Solana Investment Platform →
              </Link>
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Bags")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bags - Social Solana Trading →
              </Link>
              <Link
                href={USEFUL_LINKS.find(link => link.title === "Vector")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vector - Social Meme Coin Trading →
              </Link>
            </div>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Trading Tools</h3>
            <div className="space-y-2">
              <Link
                href={USEFUL_LINKS.find(link => link.title === "BonkBot")?.url || "#"}
                className="text-blue-600 dark:text-blue-400 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                BonkBot - Meme Coin Trading Bot →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Investment Best Practices</h2>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ul className="list-disc list-inside space-y-2 dark:text-gray-300">
            <li>Diversify your portfolio across different asset classes</li>
            <li>Start with established platforms before exploring riskier investments</li>
            <li>Never invest more than you can afford to lose</li>
            <li>Research thoroughly before making investment decisions</li>
            <li>Consider using portfolio tracking tools to monitor your investments</li>
          </ul>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Ready to Start?</h2>
        <p className="dark:text-gray-300">
          Choose the investment platform that best suits your needs and begin your investment journey today. Remember to always do your own research and consider consulting with financial advisors for personalized advice.
        </p>
      </div>
    </div>
  );
}