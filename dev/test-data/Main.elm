module Main exposing (main)

import Browser
import EnvVars
import Html exposing (li, text, ul)


main =
    ul []
        [ li [] [ text ("NODE_ENV: " ++ EnvVars.nodeEnv) ]
        ]
