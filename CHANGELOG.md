# Changelog

## [2.0.0](https://github.com/markpaul099/stewpidbot-v14/compare/v1.0.1...v2.0.0) (2026-10-27)


### ⚠ BREAKING CHANGES

* **commands:** ~say and ~announce no longer work; run npm run deploy to register /say and /announce. The prefix .env key is unused.

### Features

* **commands:** add timeout, slowmode, userinfo, avatar and poll ([39482ba](https://github.com/markpaul099/stewpidbot-v14/commit/39482badd4938f9467f6ebbfff96e19ca9ec3ea3))
* **commands:** replace ~say and ~announce with slash commands ([6f71a60](https://github.com/markpaul099/stewpidbot-v14/commit/6f71a60f05130dd4a841a59829d6f27f56657cbd))
* **commands:** slash commands, new moderation tools and admin fixes ([d34917e](https://github.com/markpaul099/stewpidbot-v14/commit/d34917ed843ddfab1b4ad05ecfa1fe83ac3362ea))


### Bug Fixes

* **admin:** limit /restart, /test-in and /test-out to the bot owner ([0a236ef](https://github.com/markpaul099/stewpidbot-v14/commit/0a236ef059dbce17770502b80cc280945ab138da))
* **admin:** validate input in embed, editembed and editmessage ([28f5432](https://github.com/markpaul099/stewpidbot-v14/commit/28f543285aa3107b059cf06c99c397fdb38060ce))
* **moderation:** harden ban, kick and unban checks and permissions ([8035284](https://github.com/markpaul099/stewpidbot-v14/commit/8035284d94f90fb1a0549390fde4693dd2743956))
* **watchdog:** detect disconnects using the Status enum ([67ff030](https://github.com/markpaul099/stewpidbot-v14/commit/67ff03021768f2e2c8f31da8c3d27da08e669dd6))

## [1.0.1](https://github.com/markpaul099/stewpidbot-v14/compare/v1.0.0...v1.0.1) (2026-10-27)


### Bug Fixes

* guard against missing channels and fix request channel cleanup ([d91aafc](https://github.com/markpaul099/stewpidbot-v14/commit/d91aafcd251f3d040670fa4219d3128a79a2679e))
* guard against missing channels and fix request channel cleanup ([56323b0](https://github.com/markpaul099/stewpidbot-v14/commit/56323b0656bc4a5a3bbdc2301633061b304c5d4e))
