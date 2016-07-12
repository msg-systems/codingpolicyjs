# codingpolicyjs

JavaScript coding policy engine for architectonical rules.
This module is available as node module, <a href='#command-line-interface'>command line interface</a> and <a href='#grunt-plugin'>grunt plugin</a>.

<p/>
<img src="https://nodei.co/npm/codingpolicy.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/msg-systems/codingpolicy.png" alt=""/>

## Modules purpose

This module is used for running architectonical rules against source code (ES5, ES6, HTML5, LESS). It is designed as a supporting tool for continous integration environments. The architectonical rules should check stuff beyond jshint, eslint and others. 

## Command Line Interface

The cli of `codingpolicy` encapsules the node module. The tool has the following interface:

```shell
codingpolicyjs: USAGE: codingpolicy [options] arguments
options:
    -V, --version       Print tool version and exit.
    -h, --help          Print this help and exit.
    -v, --verbose       Print verbose processing information.
    -r ARG, --root=ARG  Root directory for include files.
```

## Grunt Plugin

The grunt plugin requires Grunt `>=0.4.0` and  encapsules the node module. 

If you haven't used [Grunt](http://gruntjs.com/)
before, be sure to check out the [Getting
Started](http://gruntjs.com/getting-started) guide, as it explains how
to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins. Once you're familiar with that process,
you may install this plugin with this command:

```shell
npm install codingpolicyjs --save-dev
```

Once the plugin has been installed, it may be enabled inside your
Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('codingpolicyjs');
```

### codingpolicy Task

_Run this task with the `grunt codingpolicy` command._

The tasks input is a file or directory directing to the initial `codingpolicy.yaml` file.

### Task Options
| Option | Default value | Description |
| --- | --- | --- |
| root | "." | Root directory for include files. |

### Task Example

```grunt
    grunt.initConfig({
        codingpolicy: {
            "all": {
                src: ["."],
                options: {
                    root: "../../src/app"
                }
            },
            "test": {
                src: ["codingpolicyTest.yaml"],
                options: {
                    root: "../../src/test"
                }
            }
        }
    });

```

## codingpolicy.yaml

The `codingpolicy.yaml` file registers and defines the concrete `rules` for the policy check. Since a single `rule` might be used several times with different options we work with alias names for the concrete `rules`. In order to get the policy check work correctly the `rules` must be `registered` with its alias name. The module is enabled to support delegated rule configurations. The `codingpolicy.yaml` therefore is able to `import` other config files.

### Importing other config files

An `import` for another `codingpolicy.yaml` config file is done within the `codingpolicy.yaml` using a collection within the `import` attribute. 

You can `import` using 
- a glob pattern like `- **/rules*.yaml`. In this case a single file or a list of files can be imported.
- a node module name `- codingpolicyjs`. In this case the import looks for a `codingpolicy.yaml` inside the node modules root.
   
### Register coding policy rules

In order to be able to use `rules` you have to register the concrete rule class within a `register` block in the config file

The `rules.yaml` file demonstrates the registration of a `rule`. The file location is always relative to the config file.

```yaml
register:
  RegExpRule: ./RegExpRule.js
``` 

### Define coding policy rules

Concrete coding policy rules can be defined within the `rules` block in the config file. The syntax is described as followed:

```yaml
rules:
  <ruleName>:
    ruleText: <ruleText>
    fixText: <fixText>
    rule: <RuleAlias>
    options:
      includeFiles: <globPattern>
	  <any>: <value>
```

The `<ruleName>` must be unique. 
The `<ruleText>` will be displayed on coding policy execution. 
The `<fixText>` will be displayed if a rule violation is found.
The `<ruleAlias>` is the alias name of a registered `rule`.
The `options` will be handed over to any `rule`as first function argument. You can add `<any>` attribute to this block and will be able to access it in a concrete `rule`.
The `includeFiles` attribute inside the `options` is the a predefined attribute that will be handed to the concrete `rule` even if it is not set. Default value for `includeFiles` is `**/*.js`.  

### Example codingpolicy.yaml

The following example imports a specific rule file with the given glob pattern and defines the copding policy rules in the stated order. The alias names for `RegExpRule` has been defined in the imported `rules.yaml`.

```yaml
import:
# use the glob pattern to import other config files
- rules/rules.yaml
# use a node module name to import that modules codingpolicy.yaml 
- codingpolicyjs

rules:
# define a new rule with the proper attributes and options
  ConsoleLogRule:
    ruleText: "console.log usage"
    fixText: "do not check 'console.log' in - it should not be committed into the master repo - please delete it before commit"
    rule: RegExpRule
    options:
# RegExpRule needs the desired regExp as option
      regExp: '/^(.*console\.log.*)$/mg'
      includeFiles: "*(bin|lib|tasks|rules)/**/*.js"
# define a new rule with the proper attributes and options
  NoLooseEndsRule:
    ruleText: "unfinished business (TODO, FIXME etc.)"
    fixText: "tie up the loose ends"
    rule: RegExpRule
    options:
      regExp: '/^(.*(?:FIXME|TODO).*)$/img'
      includeFiles: "*(bin|lib|tasks|rules)/**/*.js"
```

## Rule interface

The coding policy is executing concrete `rules` according to the configuration file. A concrete `rule` must therefor match the proper signature to be executed correctly:

```js
    return function (options, tools) {
		
		return findings
	}

```

### Rule options

The `options` are taken from the `condingpolicy.yaml` as stated above. You can access any `options` from the config file as you defined it. Beside the `includeFiles` you will also be able to access the `root` attribute that is handed over to the concrete `rule`. The `root` attribute is coming either from the <a href='#command-line-interface'>command line interface</a> or the <a href='#grunt-plugin'>grunt plugin</a>.

### Rule tools

The `tools` are a predefined set of internal tools that help you handling your source code. 

You will be able to work with the following tools:

#### astJS

This tool encapsules `Esprima` and `astq`. `Esprima` is used for reading JavaScript source code files into an AST (abstract syntax tree). `astq` is used for queries on JavaScript ast objects.

| Attribute | Type | Description |
| --- | --- | --- |
| `astq` | node module | Direct access to the `astq` node module for JavaScript AST queries |
| `astToString` | `function (ast)` | Morphs an `ast` object into the corresponding source code using `escodegen` |
| `findViolations` | `function (ast, file, query)` | Executes the given `query` on the `ast` and reports back an  <a href='#finding-object'>`finding object`</a> pointing to the given `file` if the `query` returns results. |
| `findAndLoopAstList` | `function (root, clazzRegexp, excludedFiles, callback)` | This function loops through a list of files using the `root` value and `classRegexp` pattern. Each file will be transformed into an ast and will be handed back to the `callback` method. The `callback` method has the signature `function (ast, file)`. |

#### astHTML5

This tool encapsules `parse5` and `astq`. `parse5` is used for reading HTML5 source files into an AST. `astq` is used for queries on HTML5 ast objects.

| Attribute | Type | Description |
| --- | --- | --- |
| `astq` | node module | Direct access to the `astq` node module for HTML5 AST queries |
| `astToString` | `function (ast)` | Morphs an `ast` object into the corresponding source code using `parse5` |

#### regExpFileScanner

This tool enables you to run RegExp matches on file contents.

| Attribute | Type | Description |
| --- | --- | --- |
| `scan` | `function (root, clazzRegexp, excludedFiles, searchRegexp)` | This function loops through a list of files using the `root` value, `classRegexp` pattern and `excludedFiles` list. All matches for the given `searchRegexp` will be transformed into a `finding object` |

#### parse5FileScanner

This tool enables you to run RegExp matches on file contents.

| Attribute | Type | Description |
| --- | --- | --- |
| `scan` | `function (root, clazzRegexp, excludedFiles)` | This function loops through a list of files using the `root` value, `classRegexp` pattern and `excludedFiles` list. All matching files will be packed in a helper object with the attributes `file` and `ast`. `file` is the read file name and `ast` is the HTML5 ast object of that file. |
| `serialize` | `function (astNode)` | This function turns an `astNode` into its proper string presentation` |

## Finding objects

A `finding object` is a simple object defining two attributes: `file` and `text`.
The `file` is the file name where a violation was found. The `text` is the display text for the violation and should in most cases be the extract of the source code that violates against the `rule`.

### Example finding object
```js
{
  file: "bin\codingpolicy.js",
  text: "    console.log('foo');"
}
```

## Included rules

We already included a single `rule` named `RegExpRule` since it is often required and globally usable due to config settings.

## RegExpRule

The `RegExpRule` is registered when you import `codingpolicyjs` as node module in your own `codingpolicy.yaml` file.

It's options enable you to define your `regExp` in the config file. The other options used by this `rule` are common for all `rules`

- `root` - the root directory for all files
- `includeFiles` - a list of files where the RegExp search should be applied to
- `excludedFiles` - a list of files that can be excluded from the search