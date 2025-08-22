#include <decomp/decomp.h>
#include <iostream>

#include <render/utils/AlignedAllocator.h>

void printHelp(const decomp::CommandLineInterface& cli) {
    std::cout << "Usage: decomp [options]" << std::endl;
    std::cout << "Options:" << std::endl;
    for (const auto& option : cli.getOptions()) {
        std::cout << "\t" << option->describe().c_str() << std::endl;
    }
}

void printVersion() {
    std::cout << "decomp " << DECOMP_VERSION << std::endl;
}

int main(int argc, const char** argv) {
    decomp::Arguments args(argc, argv);

    args.set("p", "1234");

    decomp::CommandLineInterface cli;
    decomp::ApplicationOptions options;

    cli.addBoolOption(&options.printHelp, "h", "Print help");
    cli.addBoolOption(&options.printVersion, "v", "Print version");
    cli.addIntOption(&options.websocketPort, "p", "Websocket port to listen on", "6169", 1, 65535);

    try {
        cli.parse(args);
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl << std::endl;
        printHelp(cli);
        return 1;
    }

    if (options.printHelp || args.isEmpty()) {
        printHelp(cli);
        return 0;
    }

    if (options.printVersion) {
        printVersion();
        return 0;
    }

    decomp::i32 exitCode = 1;

    try {
        decomp::Application app(options);
        exitCode = app.run();
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }

    return exitCode;
}