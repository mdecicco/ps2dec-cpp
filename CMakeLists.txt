cmake_minimum_required(VERSION 3.16)
project(decompiler VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set compiler flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /Zc:__cplusplus")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} /SAFESEH:NO")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG}")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE}")

if (MSVC)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MT")
endif ()

add_compile_definitions($<$<CONFIG:Debug>:_ITERATOR_DEBUG_LEVEL=0>)
add_compile_definitions(V8_COMPRESS_POINTERS)
add_compile_definitions(BIND_DATATYPE_USERDATA_SIZE=64)

# Configure dependencies before adding them as subdirectories
set(BUILD_TESTING           OFF CACHE BOOL "" FORCE)
set(UTILS_BUILD_PLAYGROUNDS OFF CACHE BOOL "" FORCE)
set(ENABLE_CTEST            OFF CACHE BOOL "Enables testing" FORCE)
set(BUILD_EXTERNAL          OFF CACHE BOOL "Build external dependencies in /External" FORCE)
set(ENABLE_SPVREMAPPER      OFF CACHE BOOL "Enables building of SPVRemapper" FORCE)
set(ENABLE_HLSL             OFF CACHE BOOL "Enables HLSL input support" FORCE)
set(ENABLE_OPT              OFF CACHE BOOL "Enables spirv-opt capability if present" FORCE)
set(ENABLE_PCH              OFF CACHE BOOL "Enables Precompiled header" FORCE)

# Add dependencies
add_subdirectory("deps/tspp")
add_subdirectory("deps/glslang")

include(FetchContent)

set(YOGA_BUILD_TESTS        OFF CACHE BOOL "" FORCE)
FetchContent_Declare(
    yoga
    GIT_REPOSITORY https://github.com/facebook/yoga.git
    GIT_TAG v3.2.1
)
FetchContent_MakeAvailable(yoga)

# freetype
set(FT_DISABLE_PNG TRUE)
set(FT_DISABLE_BZIP2 TRUE)
set(FT_DISABLE_BROTLI TRUE)
set(FT_DISABLE_HARFBUZZ TRUE)
FetchContent_Declare(
    freetype
    GIT_REPOSITORY https://github.com/freetype/freetype.git
    GIT_TAG VER-2-13-3
)
FetchContent_MakeAvailable(freetype)

add_library(Freetype::Freetype ALIAS freetype)

set(MSDFGEN_DISABLE_SVG ON)
set(MSDFGEN_DISABLE_PNG ON)
set(MSDFGEN_USE_VCPKG OFF)
set(MSDFGEN_BUILD_STANDALONE OFF)
FetchContent_Declare(
    msdfgen-core
    GIT_REPOSITORY https://github.com/Chlumsky/msdfgen.git
    GIT_TAG v1.12.1
)
FetchContent_MakeAvailable(msdfgen-core)

# msdf-atlas-gen
set(MSDF_ATLAS_BUILD_STANDALONE OFF)
set(MSDF_ATLAS_USE_VCPKG OFF)
set(MSDF_ATLAS_USE_SKIA OFF)
set(MSDF_ATLAS_NO_ARTERY_FONT ON)
set(MSDF_ATLAS_MSDFGEN_EXTERNAL OFF)
set(MSDF_ATLAS_INSTALL OFF)
set(MSDF_ATLAS_DYNAMIC_RUNTIME OFF)
set(MSDF_ATLAS_MSDFGEN_EXTERNAL ON)
FetchContent_Declare(
    msdf-atlas-gen
    GIT_REPOSITORY https://github.com/Chlumsky/msdf-atlas-gen.git
    GIT_TAG v1.3
)
FetchContent_MakeAvailable(msdf-atlas-gen)

# Find source files
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.h" "include/*.hpp")

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

find_package(Vulkan REQUIRED)

target_link_libraries(
    ${PROJECT_NAME}
    PRIVATE
    tspp
    Vulkan::Vulkan
    glslang
    SPIRV
    glslang-default-resource-limits
    yogacore
    freetype
    msdf-atlas-gen
    msdfgen-core
    msdfgen-ext
)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/deps/glslang
    ${TSN_BIND_INCLUDE_DIR}
    ${TSN_UTILS_INCLUDE_DIR}
    ${FFI_INCLUDE_DIR}
    ${TSPP_INCLUDE_DIR}
    ${V8_INCLUDE_DIR}
    ${Vulkan_INCLUDE_DIRS}
)

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

    set(VS_ADD_NATIVE_VISUALIZERS TRUE)

    if (VS_ADD_NATIVE_VISUALIZERS)
        target_sources(${PROJECT_NAME} INTERFACE
            ${CMAKE_CURRENT_SOURCE_DIR}/debug.natvis
        )
    endif()
endif()