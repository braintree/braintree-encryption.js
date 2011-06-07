require 'erb'

ROOT_DIR = File.expand_path(File.dirname(__FILE__))
BUILD_DIR = File.join(ROOT_DIR, "build")
SPEC_DIR = File.join(ROOT_DIR, "spec")
LIB_DIR = File.join(ROOT_DIR, "lib")
PIDCRYPT_DIR = File.join(LIB_DIR, "pidCrypt")
TARGET_DIR = File.join(ROOT_DIR, "target")
SPEC_RUNNER = File.join(SPEC_DIR, "SpecRunner.html")
SJCL_DIR = File.join(LIB_DIR, "sjcl/core")

BRAINTREE_VERSION = File.read("#{LIB_DIR}/braintree.js")[/version: '([0-9.]+)'/, 1]

task :default => "test:run_default"

namespace :test do
  task :all do
    %w[chrome safari firefox].each do |browser|
      Rake::Task["test:run_#{browser}"].invoke
      sleep 3
    end
  end

  task :clean do
    rm_rf "#{File.dirname(__FILE__)}/spec/SpecRunner.html"
  end

  task :prepare => ["test:clean", "build"] do
    template = ERB.new(File.read("#{SPEC_DIR}/SpecRunner.html.erb"))
    spec_files = Dir.glob("#{SPEC_DIR}/*.js")

    result = template.result(binding)

    File.open("#{SPEC_DIR}/SpecRunner.html", "w") do |f|
      f << result
    end
  end

  task :run_chrome => :prepare do
    `open -a 'Google Chrome' #{SPEC_RUNNER}`
  end

  task :run_safari => :prepare do
    `open -a Safari #{SPEC_RUNNER}`
  end

  task :run_firefox => :prepare do
    `open -a Firefox #{SPEC_RUNNER}`
  end

  task :run_default => :prepare do
    `open #{SPEC_RUNNER}`
  end
end

namespace :build do
  task :clean do
    rm_rf TARGET_DIR
    mkdir TARGET_DIR
  end

  task :bundle => ["build:clean"] do
    files = %W[
      #{BUILD_DIR}/bundle_header.js
      #{PIDCRYPT_DIR}/pidcrypt.js
      #{PIDCRYPT_DIR}/pidcrypt_util.js
      #{PIDCRYPT_DIR}/prng4.js
      #{PIDCRYPT_DIR}/rng.js
      #{PIDCRYPT_DIR}/asn1.js
      #{PIDCRYPT_DIR}/jsbn.js
      #{PIDCRYPT_DIR}/rsa.js

      #{SJCL_DIR}/sjcl.js
      #{SJCL_DIR}/aes.js
      #{SJCL_DIR}/bitArray.js
      #{SJCL_DIR}/codecHex.js
      #{SJCL_DIR}/codecString.js
      #{SJCL_DIR}/codecBase64.js
      #{SJCL_DIR}/cbc.js
      #{SJCL_DIR}/sha256.js
      #{SJCL_DIR}/random.js

      #{LIB_DIR}/braintree.js
      #{BUILD_DIR}/bundle_footer.js
    ]
    `cat #{files.join(' ')} >> #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.js`
  end

  task :minify => ["build:bundle"] do
    `cat #{BUILD_DIR}/minified_header.js > #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.min.js`
    `ruby #{BUILD_DIR}/jsmin.rb < #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.js >> #{TARGET_DIR}/braintree-#{BRAINTREE_VERSION}.min.js`
  end
end

task :build  => ["build:clean", "build:bundle", "build:minify"]
