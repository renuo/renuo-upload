#!/usr/bin/env ruby

require 'json'
require 'highline'

def increase_version(version)
  a, b, c = version.split('.').map(&:to_i)

  cli = HighLine.new
  cli.choose do |menu|
    menu.prompt = 'patch, minor or major version bump?'
    menu.choice(:patch) { c += 1 }
    menu.choice(:minor) do
      c = 0
      b += 1
    end
    menu.choice(:major) do
      c = 0
      b = 0
      a += 1
    end
  end
  [a, b, c].join('.')
end

content = File.open('package.json').read
json = JSON.parse(content)
version = json['version']

new_version = increase_version(version)
json['version'] = new_version

`git checkout master`
`git pull origin master`
`git checkout develop`
`git pull origin develop`
`git flow release start #{new_version}`
`gulp dist`
`git add -f dist`

File.write('package.json', "#{JSON.pretty_generate(json)}\n")

`git add package.json`
`git commit -m 'release #{new_version}'`
`git checkout master`
`git merge release/#{new_version}`
`git checkout develop`
`git merge release/#{new_version}`
`git checkout master`
`git branch -D release/#{new_version}`
`git tag #{new_version}`
`git push origin master:master --tags`
`git checkout develop`
`git push origin develop:develop`
`npm publish`

