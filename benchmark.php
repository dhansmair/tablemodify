<!DOCTYPE html>
<html>
<head>
    <title>tm benchmark</title>
    <link rel='stylesheet' href='dist/tablemodify.css' />
    <link rel='stylesheet' href='dist/themes/default.css' />
    <script src='dist/tablemodify.min.js'></script>
    <script>
        window.addEventListener('DOMContentLoaded', function(){
            var tm = new Tablemodify('#myTable', {
                modules: {
                    fixed: {
                        fixHeader:true
                    },
                    /*filter: {

                    },*/
                    //sorter: {},
                    /*
                    columnStyles: {
                        all: {
                            'min-width': '100px'//,
                            //'width':'auto'
                        },
                        0: {
                            'max-width':'100px'
                        }
                    }
                    */
                }
            });
        });
    </script>
    <style>
        .tm-container {
            height:500px;
        }
    </style>
</head>
<body>
    <table id='myTable'>
        <?php
            $rowCount = 50000;
            $colCount = 10;

            $text = '<thead><tr>';
            for ($i = 0; $i < $colCount; $i++) {
                $text .= "<td>kopf $i</td>";
            }

            $text .= '</tr></thead><tbody>';

            for ($i = 0; $i < $rowCount; $i++) {
                $text .= '<tr>';
                for ($j = 0; $j < $colCount; $j++) {
                    $rand = rand(0, 2*$rowCount);
                    $text .= "<td>$rand</td>";
                }
                $text .= '</tr>';
            }
            $text .= '</tbody>';

            echo $text;
         ?>
    </table>


</body>
</html>
