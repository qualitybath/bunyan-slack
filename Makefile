test:
	@./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly
.PHONY: test