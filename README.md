# BLOCKHAUS

BlockHausBlokHaus is an on-chain long term Rental platform dAPP built on starknet

# 🌟 Overview

The BlokHaus Platform is a decentralized application (dApp) built on StarkNet, enabling homeowners to list properties and tenants to browse, filter, and book properties using RENT tokens pegged to USDC. Leveraging zk-STARK technology, it provides low-cost transactions ($0.01-$0.10), Ethereum-level security, and a transparent alternative to centralized platforms like Airbnb.

## ✨ Core Features

Decentralized Marketplace: Property listings with advanced filters, interactive maps (Leaflet.js), and detailed amenity information
Secure Communication: Encrypted Web3 messaging (XMTP) for lease negotiations and inquiries
AI Support: 24/7 Grok-powered chatbot with voice mode for onboarding, payments, and dispute resolution
User-Friendly Interface: Web2-like React.js/Tailwind CSS UI with IPFS media storage and mobile PWA support
DAO Governance: Community-driven dispute resolution and platform upgrades using STRK tokens
Stable Payments: RENT tokens pegged to USDC via Chainlink oracles with fiat on-ramps (Ready wallet, MoonPay)
Onchain Reviews: Immutable property and user ratings with reputation scoring
Optional Insurance: DeFi-based rental protection via Nexus Mutual
Analytics & Ads: Affordable homeowner services ($2-$20/month) for listing optimization

### 🪙 Why RENT Tokens?

Value Stability: USDC peg eliminates crypto volatility 
Ultra-Low Fees: 99% cheaper than traditional 15-20% platform fees
Decentralization: Smart contracts eliminate intermediaries
Global Access: Cross-chain bridging and fiat integration
Ecosystem Integration: Single token for all platform services

# Value Proposition

Transparency: All transactions and reviews recorded onchain
Cost Efficiency: Dramatically lower fees than centralized platforms
Enhanced UX: Web2 familiarity with Web3 benefits via social logins (zkLogin)
Community Governance: Democratic platform decisions vs. corporate control
Trust & Security: Onchain reputation system with optional DeFi insurance

## Quick Start
For Users
- **connect wallet:** Google/Apple/email login → auto-generated StarkNet wallet 
- **Homeowners:** List properties, upload to IPFS, buy optional ad services
- **Tenants:** Browse via filters/maps, book with RENT tokens, chat securely
- **Support:** Access 24/7 Grok chatbot with voice assistance

# For Developers

bash
<code>
git clone https://github.com/vakharys495/BlockHaus
cd blockhaus-rental-platform
npm install && cp .env.example .env:** React.js + Tailwind CSS
npm start  # Local development
</code>

## 🏗️ Technical Architecture
- Component	Technology	Purpose
- Blockchain	StarkNet (L2 on Ethereum)	Scalability and low-cost transactions
- Smart Contracts	Cairo	Property listings, payments, reviews, DAO
- Frontend	React.js + Tailwind CSS	Web2-like UI with StarkNet integration
- Storage	IPFS	Decentralized media and document storage
- Oracles	Chainlink	USDC pegging for RENT tokens
- Messaging	XMTP/StarkNet-native	Encrypted communication protocol
- AI Support	xAI Grok 3 API	Intelligent chatbot functionality
- Mobile	React Native/PWA	Cross-platform mobile access

## 🛠️ Installation

Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- StarkNet wallet (Argent X or Braavos)
- Setup Instructions
- bash
# Clone the repository
- git clone https://github.com/vakharys495/BlockHaus
- cd onchain-rental-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
Environment Configuration
Create a .env file with the following variables:

env </br>
 REACT_APP_STARKNET_NODE_URL=<Your StarkNet Node URL></br>
 REACT_APP_CHAINLINK_ORACLE=<Chainlink Oracle Address></br>
 REACT_APP_IPFS_API=<IPFS API Endpoint></br>
 REACT_APP_GROK_API_KEY=<xAI Grok API Key></br>
 REACT_APP_CONTRACT_ADDRESS=<Deployed Contract Address></br>
Run the Application
bash

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
Deploy Smart Contracts
bash
# Install StarkNet CLI
pip install cairo-lang

# Compile contracts
starknet-compile contracts/rental_platform.cairo --output rental_platform_compiled.json

# Deploy to testnet
starknet deploy --contract rental_platform_compiled.json --network alpha-goerli</br>
Update frontend with contract address

## 🤝 Contributing </br>
We welcome contributions from the community! Here's how to get started:

## Development Process

Fork the repository</br>
Create a feature branch (git checkout -b feature/amazing-feature)</br>
Commit your changes (git commit -m 'Add amazing feature')</br>
Push to the branch (git push origin feature/amazing-feature)</br>
Open a Pull Request</br>

## Guidelines

Follow our Code of Conduct</br>
Ensure all tests pass (npm test)</br>
Update documentation as needed</br>
Use conventional commit messages</br>

## Areas for Contribution

Smart contract development</br>
Frontend improvements</br>
Mobile app development</br>
Testing and QA</br>
Documentation</br>
Internationalization</br>

##Support: 🤖 24/7 AI chatbot | 📧 blockhaus.dev.info@gmail.com |🐛 GitHub Issues: Open an issue
 Community: 💬 Discord | 🐦 @blockhaus | 📢 Telegram
 
<div align="center">
Built with ❤️ on StarkNet

Website • Documentation • Demo

</div>
MIT License
