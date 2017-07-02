<!DOCTYPE html>
<html>
<head>
    <title>tm test page</title>
    <link rel="stylesheet" href="../dist/tablemodify.css" />
    <link rel="stylesheet" href="../dist/themes/blank.css" />
    <script src="../dist/tablemodify.min.js"></script>
    <style>
        section {
            background-color: lightblue;
        }
        article {
            background-color: green;
            width:80%;
        }
    </style>
    <script>
        function init() {
            /*
            // init tablemodify on the #test table
            var tm = new Tablemodify("#test", {
                theme: "blank",
                debug: false,
                modules: {
                    fixed: {
                        fixHeader: true,
                        fixFooter: true
                    }
                }
            });
            */
            var table = document.getElementById('test');
            var rows = table.tBodies[0].rows;
            var rowArray = [].slice.call(rows);
            console.log(rows);
            console.log(rowArray);
            console.log(rowArray[0].cells[0]);
        }

        window.addEventListener("DOMContentLoaded", init);
    </script>
</head>
<body>
    <section>
        <article>
            artikel 1
        </article>
        <article>
            <table id="test">
                <tbody>
                    <?php
                        $colCount = 10;
                        $rowCount = 50;
                        $str = "";

                        for ($i = 0; $i < $rowCount; $i++) {
                            $str .= "<tr>";
                            for ($j = 0; $j < $colCount; $j++) {
                                $str .= "<td>Zeile $i Spalte $j</td>";
                            }
                            $str .= "</tr>";
                        }

                        echo $str;
                    ?>

                </tbody>
            </table>
        </article>
    </section>
</body>
</html>
