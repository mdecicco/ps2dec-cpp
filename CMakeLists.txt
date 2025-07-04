cmake_minimum_required(VERSION 3.16)
project(decompiler VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set compiler flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG}")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE}")

# Force websocketpp to use C++11 features instead of Boost
add_definitions(-D_WEBSOCKETPP_CPP11_STL_)
add_definitions(-D_WEBSOCKETPP_CPP11_FUNCTIONAL_)
add_definitions(-D_WEBSOCKETPP_CPP11_SYSTEM_ERROR_)
add_definitions(-D_WEBSOCKETPP_CPP11_RANDOM_DEVICE_)
add_definitions(-D_WEBSOCKETPP_CPP11_MEMORY_)
add_definitions(-D_WEBSOCKETPP_CPP11_TYPE_TRAITS_)

# Configure websocketpp before adding it as subdirectory
set(BUILD_EXAMPLES OFF)
set(BUILD_TESTS OFF)
set(ENABLE_CPP11 ON)

# Add websocketpp subdirectory
add_subdirectory("deps/websocketpp")

# Include directories
include_directories(include)
include_directories("deps/websocketpp")
include_directories("deps/asio/asio/include")

# Find source files
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.h" "include/*.hpp")

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

# Set output directories
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib
    ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib
)

# Install rules
install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)

install(DIRECTORY include/ DESTINATION include)

if (CMAKE_VERSION VERSION_GREATER 3.7.8)
    if (MSVC_IDE)
        option(VS_ADD_NATIVE_VISUALIZERS "Configure project to use Visual Studio native visualizers" TRUE)
    else()
        set(VS_ADD_NATIVE_VISUALIZERS FALSE CACHE INTERNAL "Native visualizers are a Visual Studio extension" FORCE)
    endif()

    if (VS_ADD_NATIVE_VISUALIZERS)
        target_sources(${PROJECT_NAME} INTERFACE
            ${CMAKE_CURRENT_SOURCE_DIR}/debug.natvis
        )
    endif()
endif()