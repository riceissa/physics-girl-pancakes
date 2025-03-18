.PHONY: all
all: docs/index.html docs/recipe.js

docs/index.html: index.md template.html docs/style.css
	pandoc -f markdown -t html --template=template.html -o "$@" "$<"

docs/recipe.js: recipe.ts
	tsc --lib dom,es2017 --noImplicitReturns --strictNullChecks --noUnusedLocals --noUnusedParameters --noImplicitThis --noImplicitAny --noFallthroughCasesInSwitch --newLine LF --outfile "$@" "$<"

.PHONY: clean
clean:
	rm -f docs/index.html docs/recipe.js
