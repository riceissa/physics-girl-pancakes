.PHONY: all
all: docs/index.html docs/recipe.js

docs/index.html: index.md template.html
	pandoc -f markdown -t html --template=template.html -o "$@" "$<"

docs/recipe.js: recipe.ts
	tsc --outfile "$@" "$<"

.PHONY: clean
clean:
	rm -f docs/index.html docs/recipe.js
