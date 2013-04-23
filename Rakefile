require 'erb'

def linux?
  RUBY_PLATFORM.include?("linux")
end

ROOT_DIR = File.expand_path(File.dirname(__FILE__))
BUILD_DIR = File.join(ROOT_DIR, "build")
SPEC_DIR = File.join(ROOT_DIR, "spec")
LIB_DIR = File.join(ROOT_DIR, "lib")
TARGET_DIR = File.join(ROOT_DIR, "target")
SPEC_RUNNER = File.join(SPEC_DIR, "SpecRunner.html")
JSBN_DIR = File.join(LIB_DIR, "jsbn")
SJCL_DIR = File.join(LIB_DIR, "sjcl/core")

BRAINTREE_VERSION = File.read("#{LIB_DIR}/braintree.js")[/version: '([0-9.]+)'/, 1]

task :default => "test:run_default"

namespace :test do
  desc "test in all browsers"
  task :all do
    %w[chrome safari firefox].each do |browser|
      Rake::Task["test:run_#{browser}"].invoke
      sleep 3
    end
  end

  desc "compile specs"
  task :compile_specs do
    `coffee --compile #{SPEC_DIR}/*.coffee`
  end

  desc "clean up compiled specs"
  task :clean do
    rm_rf "#{File.dirname(__FILE__)}/spec/SpecRunner.html"
    rm_rf "#{File.dirname(__FILE__)}/spec/braintree_form_spec.js"
  end

  desc "prepare to run specs"
  task :prepare => ["test:clean", "compile_specs", "build"] do
    template = ERB.new(File.read("#{SPEC_DIR}/SpecRunner.html.erb"))
    spec_files = Dir.glob("#{SPEC_DIR}/*.js")

    result = template.result(binding)

    File.open("#{SPEC_DIR}/SpecRunner.html", "w") do |f|
      f << result
    end
  end

  desc "test in chrome"
  task :run_chrome => :prepare do
    if linux?
      `google-chrome --incongnito #{SPEC_RUNNER}`
    else
      `open -a 'Google Chrome' #{SPEC_RUNNER}`
    end
  end

  desc "test in safari"
  task :run_safari => :prepare do
    if linux?
      puts "Cannot run Safari on this platform: #{RUBY_PLATFORM}"
    else
      `open -a Safari #{SPEC_RUNNER}`
    end
  end

  desc "test in firefox"
  task :run_firefox => :prepare do
    if linux?
      `firefox #{SPEC_RUNNER}`
    else
      `open -a Firefox #{SPEC_RUNNER}`
    end
  end

  task :run_default => :prepare do
    if linux?
      `google-chrome --incongnito #{SPEC_RUNNER}`
    else
      `open #{SPEC_RUNNER}`
    end
  end
end

namespace :build do
  desc "clean up the target directory"
  task :clean do
    rm_rf TARGET_DIR
    mkdir TARGET_DIR
  end

  desc "compile coffeescript"
  task :compile_coffee do
    `coffee --compile #{LIB_DIR}/*.coffee`
  end

  desc "compile braintree.js"
  task :bundle => ["build:clean"] do
    files = %W[
      #{BUILD_DIR}/minified_header.js
      #{BUILD_DIR}/bundle_header.js

      #{LIB_DIR}/asn1.js
      #{JSBN_DIR}/base64.js
      #{JSBN_DIR}/jsbn.js
      #{JSBN_DIR}/rsa.js

      #{SJCL_DIR}/sjcl.js
      #{SJCL_DIR}/aes.js
      #{SJCL_DIR}/bitArray.js
      #{SJCL_DIR}/codecHex.js
      #{SJCL_DIR}/codecString.js
      #{SJCL_DIR}/codecBase64.js
      #{SJCL_DIR}/cbc.js
      #{SJCL_DIR}/hmac.js
      #{SJCL_DIR}/sha256.js
      #{SJCL_DIR}/random.js

      #{LIB_DIR}/braintree.js
      #{LIB_DIR}/encryptForm.js

      #{BUILD_DIR}/bundle_footer.js
    ]
    `cat #{files.join(' ')} >> #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.js`
  end

  desc "compile braintree.js"
  task :bundlenode => ["build:clean"] do
    files = %W[
      #{BUILD_DIR}/minified_header.js
      #{BUILD_DIR}/bundle_header_node.js

      #{LIB_DIR}/asn1.js
      #{JSBN_DIR}/base64.js
      #{JSBN_DIR}/jsbn.js
      #{JSBN_DIR}/rsa.js

      #{SJCL_DIR}/sjcl.js
      #{SJCL_DIR}/aes.js
      #{SJCL_DIR}/bitArray.js
      #{SJCL_DIR}/codecHex.js
      #{SJCL_DIR}/codecString.js
      #{SJCL_DIR}/codecBase64.js
      #{SJCL_DIR}/cbc.js
      #{SJCL_DIR}/hmac.js
      #{SJCL_DIR}/sha256.js
      #{SJCL_DIR}/random.js

      #{LIB_DIR}/braintree.js
      #{LIB_DIR}/encryptForm.js

      #{BUILD_DIR}/bundle_footer_node.js
    ]
    `cat #{files.join(' ')} >> #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.js`
  end

  desc "minify braintree.js"
  task :minify => ["build:bundle"] do
    `cat #{BUILD_DIR}/minified_header.js > #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.min.js`
    `ruby #{BUILD_DIR}/jsmin.rb < #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.js >> #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.min.js`
  end
end

desc "build braintree.js"
task :build  => ["build:clean", "build:compile_coffee", "build:bundle", "build:minify"]

desc "build braintree.js for node"
task :buildnode => ["build:clean", "build:compile_coffee", "build:bundlenode", "build:minify"]
